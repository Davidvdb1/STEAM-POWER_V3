//#region IMPORTS
// We'll use BabylonJS from CDN - make sure to include the script in your HTML
// or add appropriate import if using a bundler
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
//#endregion SIMULATION

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
    }

    // component attributes
    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        
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
    }
    
    _preventScroll(event) {
        event.preventDefault();
    }
    
    _initializeBabylonJS() {
        // Get the canvas element
        const canvas = this._shadowRoot.getElementById('renderCanvas');
        
        // Check if BabylonJS is available
        if (typeof BABYLON === 'undefined') {
            console.error('BabylonJS is not loaded. Make sure to include the BabylonJS script.');
            return;
        }
        
        // Initialize the BabylonJS engine
        this.engine = new BABYLON.Engine(canvas, true);
        
        // Create a scene
        this.scene = new BABYLON.Scene(this.engine);
        
        // Update camera settings to prevent scrolling issues
        this.camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 10, BABYLON.Vector3.Zero(), this.scene);
        this.camera.attachControl(canvas, true, false, 0); // noPreventDefault = false
        this.camera.useFramingBehavior = true;
        
        // Add a light
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
        
        // Create a simple object (a sphere)
        const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, this.scene);
        
        // Add material to the sphere
        const material = new BABYLON.StandardMaterial("material", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.5, 0, 0.5);
        sphere.material = material;
        
        // Handle canvas resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
    
    _startRenderLoop() {
        if (this.engine && this.scene) {
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        }
    }
});
//#endregion CLASS
