import { createSettingsPanel } from '../ui/settingsPanel.js';
import { loadModels, updateSunAndSolarPanel } from '../models/modelLoader.js';
import { updateWindmillBlades } from '../models/windmill.js';
import { getSunPosition } from '../utils/sunCalculator.js';

//#region TEMPLATE
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/simulation/style.css';
    </style>
    <div class="simulation-container">
        <canvas id="renderCanvas"></canvas>
    </div>
`;
//#endregion TEMPLATE

//#region CLASS
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
        
        // Component models
        this.solarPanel = null;
        this.windmill = null;
        this.sunRoot = null;
        this.wheel = null;
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    connectedCallback() {
        if (this.initialized) return; // Prevent re-initialization
        this.initialized = true;

        // Initialize the BabylonJS scene
        this._initializeBabylonJS();
        
        // Start the render loop
        this._startRenderLoop();
        
        // Set up resize observer for high resolution rendering
        this._setupResizeObserver();
    }
    
    disconnectedCallback() {

    }
    
    _preventScroll = (event) => {
        event.preventDefault();
    }
    
    // Custom wheel handler for gentler scrolling
    _customWheelHandler = (event) => {
        event.preventDefault();
        
        // Apply a much smaller delta value to reduce zoom speed
        const delta = event.deltaY * 0.0005;
        this.camera.radius += delta * this.camera.radius;
        
        // Ensure radius stays within limits
        if (this.camera.radius > this.camera.upperRadiusLimit) {
            this.camera.radius = this.camera.upperRadiusLimit;
        }
        if (this.camera.radius < this.camera.lowerRadiusLimit) {
            this.camera.radius = this.camera.lowerRadiusLimit;
        }
    }
    
    _handleResize = () => {
        if (this.engine) {
            this._updateCanvasSize();
            this.engine.resize();
        }
    }
    
    _setupResizeObserver() {
        const container = this._shadowRoot.querySelector('.simulation-container');
        
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

    async _updateSunAndSolarPanel(street, city, postal) {
        await updateSunAndSolarPanel(this, street, city, postal);
    }
    
    async _initializeBabylonJS() {
        // Get the canvas element from shadow DOM
        const canvas = this._shadowRoot.getElementById('renderCanvas');
        
        // Initialize the BabylonJS engine with high DPI support
        this.engine = new BABYLON.Engine(canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            adaptToDeviceRatio: true
        });
        
        // Create scene
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0.529, 0.808, 0.922, 1);

        // Camera with gentler scrolling settings
        this.camera = new BABYLON.ArcRotateCamera("Camera", 
            Math.PI / 2, Math.PI / 4, 10, 
            new BABYLON.Vector3(0, 0, 0), this.scene);
            
        // Make scrolling more gentle by adjusting camera properties
        this.camera.wheelPrecision = 50; // Higher values make zooming more gentle (default is 3)
        this.camera.inertia = 0.8; // Higher values (0-1) create smoother camera movement
        this.camera.panningSensibility = 1000; // Higher values reduce panning speed
        this.camera.angularSensibilityX = 1000; // Lower rotation sensitivity
        this.camera.angularSensibilityY = 1000; // Lower rotation sensitivity
        
        this.camera.attachControl(canvas, true);
        this.camera.upperRadiusLimit = 10;
        this.camera.lowerRadiusLimit = 3;
        
        // Light
        new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), this.scene);
        
        // Create 3D labels for directions
        this._create3DCompass(this.scene);

        // Create settings UI
        createSettingsPanel(
            this.scene,
            this,
            (bladeCount) => this._handleBladeCountChange(bladeCount),
            (street, city, postal) => this._updateSunAndSolarPanel(street, city, postal)
        );

        // Load all models
        await loadModels(this.scene, this);
        
        // Add custom wheel handler for even gentler scrolling
        canvas.removeEventListener('wheel', this._preventScroll);
        canvas.addEventListener('wheel', this._customWheelHandler, { passive: false });
        canvas.addEventListener('touchmove', this._preventScroll, { passive: false });
    }

    _create3DCompass(scene) {
        this._create3DLabel("N", new BABYLON.Vector3(0, 0.5, -2.8), scene);
        this._create3DLabel("Z", new BABYLON.Vector3(0, 0, 2.8), scene);
        this._create3DLabel("O", new BABYLON.Vector3(-3, 0, -0.2), scene);
        this._create3DLabel("W", new BABYLON.Vector3(3, 0, -0.2), scene);
    }
    
    _create3DLabel(text, position, scene) {
        const plane = BABYLON.MeshBuilder.CreatePlane("labelPlane_" + text, { width: 1.5, height: 0.5 }, scene);
        plane.position = position;

        const dynamicTexture = new BABYLON.DynamicTexture("dt_" + text, { width: 512, height: 256 }, scene);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, null, 140, "bold 80px Arial", "black", "transparent", true);

        const material = new BABYLON.StandardMaterial("mat_" + text, scene);
        material.diffuseTexture = dynamicTexture;
        material.emissiveColor = new BABYLON.Color3(1, 1, 1);
        material.backFaceCulling = false;
        plane.material = material;
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        return plane;
    }
    
    _startRenderLoop() {
        if (this.engine && this.scene) {
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        }
    }
  
    async _handleBladeCountChange(bladeCount) {
        await updateWindmillBlades(this.scene, this, bladeCount);
    }
}
//#endregion CLASS
