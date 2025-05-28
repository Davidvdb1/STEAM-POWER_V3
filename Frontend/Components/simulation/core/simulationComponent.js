import { createEngine, startRenderLoop } from './simulationEngine.js';
import { setupScene } from './simulationScene.js';
import { loadModels } from '../models/modelLoader.js';
import { create3DLabel, createSettings } from '../utils/uiElements.js';
import { fetchWindDirection } from '../utils/weatherData.js';

// Component template
const template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/simulation/style.css';
    </style>
    <div class="simulation-container">
        <canvas id="renderCanvas"></canvas>
    </div>
`;

export class SimulationComponent extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        
        // BabylonJS properties
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.resizeObserver = null;
        this.windmill = null;
        this.wheel = null;
        this.solarPanel = null;
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    connectedCallback() {
        // Initialize the BabylonJS scene
        this._initializeBabylonJS();
        
        // Start the render loop
        this._startRenderLoop();
        
        // Prevent wheel events from propagating to prevent page scrolling
        const canvas = this._shadowRoot.getElementById('renderCanvas');
        canvas.addEventListener('wheel', this._preventScroll);
        
        // Also prevent touch events from scrolling
        canvas.addEventListener('touchmove', this._preventScroll);
        
        // Set up resize observer for high resolution rendering
        this._setupResizeObserver();
    }
    
    disconnectedCallback() {
        // Clean up resources when component is removed
        const canvas = this._shadowRoot.getElementById('renderCanvas');
        if (canvas) {
            canvas.removeEventListener('wheel', this._preventScroll);
            canvas.removeEventListener('touchmove', this._preventScroll);
        }
        
        if (this.engine) {
            this.engine.dispose();
        }
        
        // Remove resize listener
        window.removeEventListener('resize', this._handleResize);
        
        // Disconnect the resize observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
    
    _preventScroll(event) {
        event.preventDefault();
    }
    
    _handleResize = () => {
        if (this.engine) {
            this._updateCanvasSize();
            this.engine.resize();
        }
    }
    
    _setupResizeObserver() {
        const container = this._shadowRoot.querySelector('.simulation-container');
        const canvas = this._shadowRoot.getElementById('renderCanvas');
        
        // Use ResizeObserver to detect size changes with higher precision
        this.resizeObserver = new ResizeObserver(() => {
            this._updateCanvasSize();
            if (this.engine) {
                this.engine.resize();
            }
        });
        
        this.resizeObserver.observe(container);
        
        // Initial size adjustment
        this._updateCanvasSize();
    }
    
    _updateCanvasSize() {
        const container = this._shadowRoot.querySelector('.simulation-container');
        const canvas = this._shadowRoot.getElementById('renderCanvas');
        
        if (container && canvas) {
            // Get the actual displayed size
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            // Only update if needed to avoid unnecessary reflows
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
        }
    }
    
    async _initializeBabylonJS() {
        // Get the canvas element from shadow DOM
        const canvas = this._shadowRoot.getElementById('renderCanvas');
        
        // Initialize the BabylonJS engine
        this.engine = createEngine(canvas);
        
        // Create and setup scene using the dedicated module
        this.scene = setupScene(this.engine, canvas);
        
        // Get camera reference from the scene (needed for later use)
        this.camera = this.scene.getCameraByName("Camera");

        // Create 3D labels for directions
        create3DLabel("N", new BABYLON.Vector3(0, 0.5, -2.8), this.scene);
        create3DLabel("Z", new BABYLON.Vector3(0, 0, 2.8), this.scene);
        create3DLabel("O", new BABYLON.Vector3(-3, 0, -0.2), this.scene);
        create3DLabel("W", new BABYLON.Vector3(3, 0, -0.2), this.scene);

        // Create settings panel
        createSettings(this.scene, (value) => this._loadTurbine(value));
        
        // Load all models
        await loadModels(this.scene, this);
        
        // Handle window resize
        window.addEventListener('resize', this._handleResize);
    }

    async _loadTurbine(bladeCount) {
        // This function is now imported from windmill.js through modelLoader.js
        const fileName = `turbine_${bladeCount}_blade${bladeCount === 1 ? '' : 's'}.glb`;

        // Dispose previous turbine if exists
        if (this.windmill) {
            this.windmill.dispose();
            this.windmill = null;
        }

        // Load new turbine
        BABYLON.SceneLoader.ImportMesh("", "", `../Frontend/Assets/GLBs/${fileName}`, this.scene, async (meshes) => {
            this.windmill = meshes.find(m => m.name === "__root__");
            if (this.windmill) {
                this.windmill.scaling = new BABYLON.Vector3(5, 5, 5);
                this.windmill.position = new BABYLON.Vector3(-1.1, -0.1, 0.5);
                this.windmill.rotation = new BABYLON.Vector3(0, -1.1, 0);

                const degrees = await fetchWindDirection();  //windrichting ophalen
                const radians = BABYLON.Angle.FromDegrees(degrees + 180).radians();
                this.windmill.rotation = new BABYLON.Vector3(0, radians, 0);  //draaien naar wind

                this.dragBehaviorWind = new BABYLON.PointerDragBehavior();
                this.dragBehaviorWind.useObjectOrientationForDragging = false;
                this.dragBehaviorWind.enabled = false;
                this.windmill.addBehavior(this.dragBehaviorWind);
            }
        });
    }
    
    _startRenderLoop() {
        startRenderLoop(this.engine, this.scene);
    }
}
