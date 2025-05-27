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

        this._createSettings(this.scene);

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
        this._loadTurbine(3);

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
        BABYLON.SceneLoader.ImportMesh("", "", "../Frontend/Assets/GLBs/solar.glb", this.scene, async (meshes) => {
            this.solarPanel = meshes.find(m => m.name === "__root__");
            if (this.solarPanel) {
                this.solarPanel.scaling = new BABYLON.Vector3(0.02, 0.02, 0.02);
                this.solarPanel.position = new BABYLON.Vector3(1.12, 0.55, -0.6);
                this.solarPanel.rotation = new BABYLON.Vector3(0, 0, 0);
                this.dragBehaviorSolar = new BABYLON.PointerDragBehavior();
                this.dragBehaviorSolar.useObjectOrientationForDragging = false;
                this.dragBehaviorSolar.enabled = false;
                this.solarPanel.addBehavior(this.dragBehaviorSolar);

                        // Zonpositie ophalen en zonnepaneel richten
        const street = "Geldenaaksebaan 335";
        const city = "Leuven";
        const postal = "3001";
        const date = new Date();

        const { azimuth, altitude } = await SunCalc.getSolarPositionForLocation(street, city, postal, date);
        const x = Math.cos(altitude) * Math.sin(azimuth);
        const y = Math.sin(altitude);
        const z = Math.cos(altitude) * Math.cos(azimuth);
        const target = new BABYLON.Vector3(x * 4, y * 4, z * 4);

        const dir = target.subtract(this.solarPanel.position).normalize();
        const yaw = Math.atan2(dir.x, dir.z) +1;
        const pitch = Math.asin(dir.y);

        this.solarPanel.rotation = new BABYLON.Vector3(pitch, yaw, 0);
            }
        });

        // 4. Calculate estimated solar power output
        const panelNormal = new BABYLON.Vector3(0, 0, 1);
        const worldMatrix = this.solarPanel.getWorldMatrix();
        const worldNormal = BABYLON.Vector3.TransformNormal(panelNormal, worldMatrix).normalize();
        const sunDirection = dir.negate(); 

        const angleFactor = BABYLON.Vector3.Dot(worldNormal, sunDirection); 
        const irradiance = 1000;
        const area = 1.6;
        const efficiency = 0.2;

        const powerOutput = Math.max(0, irradiance * area * efficiency * angleFactor);
        console.log("Estimated solar power output (W):", powerOutput.toFixed(2));
        
        // Handle window resize
        window.addEventListener('resize', this._handleResize);
    }

    _loadTurbine(bladeCount) {
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

                const degrees = await this.fetchWindDirection();  //windrichting ophalen
                const radians = BABYLON.Angle.FromDegrees(degrees + 180).radians();
                this.windmill.rotation = new BABYLON.Vector3(0, radians, 0);  //draaien naar wind

                this.dragBehaviorWind = new BABYLON.PointerDragBehavior();
                this.dragBehaviorWind.useObjectOrientationForDragging = false;
                this.dragBehaviorWind.enabled = false;
                this.windmill.addBehavior(this.dragBehaviorWind);
            }
        });
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

    _createLine() {
        const line = new BABYLON.GUI.Rectangle()
        line.thickness = 1
        line.width = "90%"
        line.color = "white"
        line.height = "1px"
        return line
    }

    _createSettings() {
        // creates a full-screen 2D GUI layer over the whole 3D scene
        const GUI = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI")

        // settings container
        const settingsPanel = new BABYLON.GUI.Rectangle()
        settingsPanel.background = "rgba(0, 0, 0, 0.5)";
        settingsPanel.width = "400px"
        settingsPanel.height = "800px"
        settingsPanel.color = "gray";
        settingsPanel.cornerRadius = "10"
        settingsPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        settingsPanel.paddingRight = "50px"
        GUI.addControl(settingsPanel)

        // layout container
        const layout = new BABYLON.GUI.StackPanel()
        layout.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        settingsPanel.addControl(layout)

        // settings title
        const title = new BABYLON.GUI.TextBlock()
        title.text = "Instellingen"
        title.fontSize = 30;
        title.color = "white";
        title.height = "80px";
        layout.addControl(title)
        
        // line
        layout.addControl(this._createLine());

        // location title
        const locationTitle = new BABYLON.GUI.TextBlock()
        locationTitle.text = "Locatie"
        locationTitle.fontSize = 25
        locationTitle.color = "white"
        locationTitle.height = "50px"
        layout.addControl(locationTitle)
        
        // line
        layout.addControl(this._createLine());

        // location text
        const locationText = new BABYLON.GUI.TextBlock()
        locationText.text = "Verander de huidige locatie."
        locationText.fontSize = 20
        locationText.color = "white"
        locationText.width = "90%"
        locationText.height = "50px"
        locationText.paddingTop = "10px"
        layout.addControl(locationText)

        // street
        const street = new BABYLON.GUI.InputText()
        street.width = "90%"
        street.height = "50px"
        street.placeholderText = "Straat..."
        street.background = "white"
        street.color = "black"
        street.focusedBackground = "white"
        street.paddingTop = "10px"
        layout.addControl(street)
        
        // city
        const city = new BABYLON.GUI.InputText()
        city.width = "90%"
        city.height = "50px"
        city.placeholderText = "Stad..."
        city.background = "white"
        city.color = "black"
        city.focusedBackground = "white"
        city.paddingTop = "10px"
        layout.addControl(city)

        // postal code
        const code = new BABYLON.GUI.InputText()
        code.width = "90%"
        code.height = "50px"
        code.placeholderText = "Postcode..."
        code.background = "white"
        code.color = "black"
        code.focusedBackground = "white"
        code.paddingTop = "10px"
        layout.addControl(code)

        // "Change" button
        const changeButton = BABYLON.GUI.Button.CreateSimpleButton("changeBtn", "Wijzig");
        changeButton.width = "90%";
        changeButton.height = "70px";
        changeButton.color = "black";             
        changeButton.background = "white"; 
        changeButton.paddingTop = "10px"
        changeButton.paddingBottom = "20px"      
        layout.addControl(changeButton);

        layout.addControl(this._createLine());

        // wind title
        const windTitle = new BABYLON.GUI.TextBlock()
        windTitle.text = "Windturbine"
        windTitle.fontSize = 25
        windTitle.color = "white"
        windTitle.height = "50px"
        layout.addControl(windTitle)

        layout.addControl(this._createLine());

        const windText = new BABYLON.GUI.TextBlock()
        windText.text = "Pas het aantal wieken aan."
        windText.fontSize = 20
        windText.color = "white"
        windText.width = "90%"
        windText.height = "50px"
        layout.addControl(windText)

        // Slider for blade count
        const bladeSlider = new BABYLON.GUI.Slider();
        bladeSlider.minimum = 0;
        bladeSlider.maximum = 5;
        bladeSlider.step = 1;
        bladeSlider.value = 3;
        bladeSlider.height = "20px";
        bladeSlider.width = "90%";
        bladeSlider.color = "white";
        bladeSlider.background = "gray";
        bladeSlider.thumbColor = "rgba(30, 30, 30, 1.0)";
        bladeSlider.borderColor = "rgba(30, 30, 30, 1.0)"
        layout.addControl(bladeSlider)

        bladeSlider.onValueChangedObservable.add((value) => {
            this._loadTurbine(value);
        });

        // Grid for tick labels
        const tickGrid = new BABYLON.GUI.Grid();
        tickGrid.width = "100%";
        tickGrid.height = "50px";
        tickGrid.paddingTop = "10px";
        tickGrid.paddingBottom = "20px"

        // Create 6 columns (for 0 to 5)
        for (let i = 0; i <= 5; i++) {
            tickGrid.addColumnDefinition(1 / 6); // Each column is 1/6th of the width
        }

        // Add labels to the grid
        for (let i = 0; i <= 5; i++) {
            const tick = new BABYLON.GUI.TextBlock();
            tick.text = i.toString();
            tick.color = "white";
            tick.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            tickGrid.addControl(tick, 0, i); // row 0, column i
        }
        layout.addControl(tickGrid);

        // line
        layout.addControl(this._createLine());
    
        return GUI;
    }
    
    _startRenderLoop() {
        if (this.engine && this.scene) {
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        }
    }
  
    async fetchWindDirection() {
        const lat = 50.8798;  // Leuven
        const lon = 4.7005;
        const response = await fetch(`http://localhost:3000/weather/windrichting?lat=${lat}&lon=${lon}`);
        const data = await response.json();
        return data.wind_direction_deg;
    }
});
//#endregion CLASS
