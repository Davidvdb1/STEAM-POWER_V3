//#region IMPORTS
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
        this.resizeObserver = null;
        
        // Draggable objects properties
        this.solarPanel = null;
        this.windmill = null;
        this.wheel = null;

        this.dragBehaviorSolar = null;
        this.dragBehaviorWind = null;
        this.dragBehaviorWheel = null;

        this.dragEnabledSolar = false;
        this.dragEnabledWind = false;
        this.dragEnabledWheel = false;

        this.isRotatingSolar = false;
        this.isRotatingWind = false;
        this.isRotatingWheel = false;

        this.startingX = null;
        this.advancedTexture = null;
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
        
        // Check if BabylonJS is available
        if (typeof BABYLON === 'undefined') {
            console.error('BabylonJS is not loaded. Make sure to include the BabylonJS script.');
            return;
        }
        
        // Initialize the BabylonJS engine with high DPI support
        this.engine = new BABYLON.Engine(canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            adaptToDeviceRatio: true // Enable high DPI rendering
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

        // Load Windmill
        BABYLON.SceneLoader.ImportMesh("", "", "../Frontend/Assets/GLBs/windmill.glb", this.scene, (meshes) => {
            this.windmill = meshes.find(m => m.name === "__root__");
            if (this.windmill) {
                this.windmill.scaling = new BABYLON.Vector3(0.0022, 0.0022, 0.0022);
                this.windmill.position = new BABYLON.Vector3(-1.5, -0.05, 0);
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

        // Create GUI
        this._createGUI();

        // Handle rotation dragging for all objects
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (this.isRotatingSolar && this.solarPanel) {
                this._handleObjectRotation(pointerInfo, this.solarPanel);
            } else if (this.isRotatingWind && this.windmill) {
                this._handleObjectRotation(pointerInfo, this.windmill);
            } else if (this.isRotatingWheel && this.wheel) {
                this._handleObjectRotation(pointerInfo, this.wheel);
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

    _createGUI() {
        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const canvas = this._shadowRoot.getElementById('renderCanvas');

        // Solar Panel GUI
        const panelSolar = this._createInventoryPanel("zonnepaneel", "40px");
        const moveBtnSolar = this._createInventoryItem("Verplaats", panelSolar);
        const rotateBtnSolar = this._createInventoryItem("Draai", panelSolar);

        // Windmill GUI
        const panelWind = this._createInventoryPanel("windmolen", "240px");
        const moveBtnWind = this._createInventoryItem("Verplaats", panelWind);
        const rotateBtnWind = this._createInventoryItem("Draai", panelWind);

        // Wheel GUI
        const panelWheel = this._createInventoryPanel("rad", "400px");
        const moveBtnWheel = this._createInventoryItem("Verplaats", panelWheel);
        const rotateBtnWheel = this._createInventoryItem("Draai", panelWheel);

        // Button events: Solar
        moveBtnSolar.onPointerDownObservable.add(() => {
            if (!this.solarPanel || !this.dragBehaviorSolar) return;
            this.dragEnabledSolar = !this.dragEnabledSolar;
            this.dragBehaviorSolar.enabled = this.dragEnabledSolar;
            moveBtnSolar.background = this.dragEnabledSolar ? "#555" : "#333";
            if (this.dragEnabledSolar) {
                this.isRotatingSolar = false;
                rotateBtnSolar.background = "#333";
                this.camera.attachControl(canvas, true, false);
            }
        });

        rotateBtnSolar.onPointerDownObservable.add(() => {
            if (!this.solarPanel) return;
            this.isRotatingSolar = !this.isRotatingSolar;
            rotateBtnSolar.background = this.isRotatingSolar ? "#555" : "#333";
            if (this.isRotatingSolar) {
                this.dragEnabledSolar = false;
                this.dragBehaviorSolar.enabled = false;
                moveBtnSolar.background = "#333";
                this.camera.detachControl(canvas);
            } else {
                this.camera.attachControl(canvas, true, false);
            }
        });

        // Button events: Windmill
        moveBtnWind.onPointerDownObservable.add(() => {
            if (!this.windmill || !this.dragBehaviorWind) return;
            this.dragEnabledWind = !this.dragEnabledWind;
            this.dragBehaviorWind.enabled = this.dragEnabledWind;
            moveBtnWind.background = this.dragEnabledWind ? "#555" : "#333";
            if (this.dragEnabledWind) {
                this.isRotatingWind = false;
                rotateBtnWind.background = "#333";
                this.camera.attachControl(canvas, true, false);
            }
        });

        rotateBtnWind.onPointerDownObservable.add(() => {
            if (!this.windmill) return;
            this.isRotatingWind = !this.isRotatingWind;
            rotateBtnWind.background = this.isRotatingWind ? "#555" : "#333";
            if (this.isRotatingWind) {
                this.dragEnabledWind = false;
                this.dragBehaviorWind.enabled = false;
                moveBtnWind.background = "#333";
                this.camera.detachControl(canvas);
            } else {
                this.camera.attachControl(canvas, true, false);
            }
        });

        // Button events: Wheel
        moveBtnWheel.onPointerDownObservable.add(() => {
            if (!this.wheel || !this.dragBehaviorWheel) return;
            this.dragEnabledWheel = !this.dragEnabledWheel;
            this.dragBehaviorWheel.enabled = this.dragEnabledWheel;
            moveBtnWheel.background = this.dragEnabledWheel ? "#555" : "#333";
            if (this.dragEnabledWheel) {
                this.isRotatingWheel = false;
                rotateBtnWheel.background = "#333";
                this.camera.attachControl(canvas, true, false);
            }
        });

        rotateBtnWheel.onPointerDownObservable.add(() => {
            if (!this.wheel) return;
            this.isRotatingWheel = !this.isRotatingWheel;
            rotateBtnWheel.background = this.isRotatingWheel ? "#555" : "#333";
            if (this.isRotatingWheel) {
                this.dragEnabledWheel = false;
                this.dragBehaviorWheel.enabled = false;
                moveBtnWheel.background = "#333";
                this.camera.detachControl(canvas);
            } else {
                this.camera.attachControl(canvas, true, false);
            }
        });
    }

    _createInventoryPanel(titleText, topPadding) {
        const panel = new BABYLON.GUI.StackPanel();
        panel.width = "300px";
        panel.isVertical = true;
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        panel.paddingRight = "10px";
        panel.paddingTop = topPadding;
        this.advancedTexture.addControl(panel);

        const title = new BABYLON.GUI.TextBlock();
        title.text = titleText;
        title.height = "40px";
        title.color = "black";
        title.fontSize = "24px";
        title.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel.addControl(title);

        return panel;
    }

    _createInventoryItem(labelText, parentPanel) {
        const box = new BABYLON.GUI.Rectangle();
        box.width = "180px";
        box.height = "60px";
        box.cornerRadius = 10;
        box.color = "white";
        box.thickness = 2;
        box.background = "#333";
        box.paddingTop = "10px";
        parentPanel.addControl(box);

        const label = new BABYLON.GUI.TextBlock();
        label.text = labelText;
        label.color = "white";
        label.fontSize = "16px";
        box.addControl(label);

        return box;
    }

    _handleObjectRotation(pointerInfo, object) {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                this.startingX = pointerInfo.event.clientX;
                break;
            case BABYLON.PointerEventTypes.POINTERUP:
                this.startingX = null;
                break;
            case BABYLON.PointerEventTypes.POINTERMOVE:
                if (this.startingX !== null) {
                    const deltaX = pointerInfo.event.clientX - this.startingX;
                    object.rotation.y += deltaX * 0.005;
                    this.startingX = pointerInfo.event.clientX;
                }
                break;
        }
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
