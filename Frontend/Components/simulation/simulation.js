//#region IMPORTS
import SunCalc from './solar.js';
//#endregion IMPORTS

//#region SIMULATION
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/simulation/style.css';
    </style>
    <div class="simulation-container">
        <canvas id="renderCanvas"></canvas>
    </div>
`;

//#region CLASS 
window.customElements.define('simulation-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        
        // BabylonJS properties
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.resizeObserver = null;

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
    
    _initializeBabylonJS() {
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

        // Camera
        this.camera = new BABYLON.ArcRotateCamera("Camera", 
            Math.PI / 2, Math.PI / 4, 10, 
            new BABYLON.Vector3(0, 0, 0), this.scene);
        this.camera.attachControl(canvas, true);
        this.camera.upperRadiusLimit = 10;
        this.camera.lowerRadiusLimit = 3;
        
        // Light
        new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), this.scene);

        // Sun
        BABYLON.SceneLoader.ImportMesh("", "", "../Frontend/Assets/GLBs/sun3.glb", this.scene, async (meshes) => {
            const street = "Geldenaaksebaan 335";
            const city = "Leuven";
            const postal = "3001";
            const date = new Date();
            const { azimuth, altitude } = await SunCalc.getSolarPositionForLocation(street, city, postal, date);
            const x = Math.cos(altitude) * Math.sin(azimuth);
            const y = Math.sin(altitude);
            const z = Math.cos(altitude) * Math.cos(azimuth);
            
            const sunRoot = meshes.find(m => m.name === "__root__");

            if (sunRoot) {
                const distance = 4;
                sunRoot.scaling = new BABYLON.Vector3(0.05, 0.05, 0.05);
                sunRoot.position = new BABYLON.Vector3(x * distance, y * distance, z * distance);
                sunRoot.rotation = new BABYLON.Vector3(0, 0.8, 0);
            }
        });
        
        // Create 3D labels for directions
        this._create3DLabel("N", new BABYLON.Vector3(0, 0.5, -2.8), this.scene);
        this._create3DLabel("Z", new BABYLON.Vector3(0, 0, 2.8), this.scene);
        this._create3DLabel("O", new BABYLON.Vector3(-3, 0, -0.2), this.scene);
        this._create3DLabel("W", new BABYLON.Vector3(3, 0, -0.2), this.scene);

        // Load environment
        BABYLON.SceneLoader.Append("", "../Frontend/Assets/GLBs/environment.glb", this.scene, function () {});

        // Load House
        BABYLON.SceneLoader.ImportMesh("", "", "../Frontend/Assets/GLBs/house.glb", this.scene, (meshes) => {
            const houseRoot = meshes.find(m => m.name === "__root__");
            if (houseRoot) {
                houseRoot.scaling = new BABYLON.Vector3(0.00009, 0.00009, 0.00009);
                houseRoot.position = new BABYLON.Vector3(0.92, 0, -0.225);
                houseRoot.rotation = new BABYLON.Vector3(0, -0.41, 0);
            }
        });

        // Load turbine
        BABYLON.SceneLoader.ImportMesh("", "", "../Frontend/Assets/GLBs/turbine_4_blades.glb", this.scene, (meshes) => {
            this.windmill = meshes.find(m => m.name === "__root__");
            if (this.windmill) {
                this.windmill.scaling = new BABYLON.Vector3(5, 5, 5);
                this.windmill.position = new BABYLON.Vector3(0, 0, 0);
                this.windmill.rotation = new BABYLON.Vector3(0, 0, 0);
                this.dragBehaviorWind = new BABYLON.PointerDragBehavior();
                this.dragBehaviorWind.useObjectOrientationForDragging = false;
                this.dragBehaviorWind.enabled = false;
                this.windmill.addBehavior(this.dragBehaviorWind);
            }
        });

        // Load Wheel
        BABYLON.SceneLoader.ImportMesh("", "", "../Frontend/Assets/GLBs/wheel.glb", this.scene, (meshes) => {
            this.wheel = meshes.find(m => m.name === "__root__");
            if (this.wheel) {
                this.wheel.scaling = new BABYLON.Vector3(0.15, 0.15, 0.15);
                this.wheel.position = new BABYLON.Vector3(1, 0.07, 0.7);
                this.wheel.rotation = new BABYLON.Vector3(0, 1, 0);
                this.dragBehaviorWheel = new BABYLON.PointerDragBehavior();
                this.dragBehaviorWheel.useObjectOrientationForDragging = false;
                this.dragBehaviorWheel.enabled = false;
                this.wheel.addBehavior(this.dragBehaviorWheel);
            }
        });

        // Load Solar Panel
        BABYLON.SceneLoader.ImportMesh("", "", "../Frontend/Assets/GLBs/solar.glb", this.scene, (meshes) => {
            this.solarPanel = meshes.find(m => m.name === "__root__");
            if (this.solarPanel) {
                this.solarPanel.scaling = new BABYLON.Vector3(0.02, 0.02, 0.02);
                this.solarPanel.position = new BABYLON.Vector3(1.12, 0.55, -0.6);
                this.solarPanel.rotation = new BABYLON.Vector3(0, 0, 0);
                this.dragBehaviorSolar = new BABYLON.PointerDragBehavior();
                this.dragBehaviorSolar.useObjectOrientationForDragging = false;
                this.dragBehaviorSolar.enabled = false;
                this.solarPanel.addBehavior(this.dragBehaviorSolar);
            }
        });

        // Handle window resize
        window.addEventListener('resize', this._handleResize);
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
});