window.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true);

    let solarPanel = null;
    let windmill = null;
    let wheel = null;

    let dragBehaviorSolar = null;
    let dragBehaviorWind = null;
    let dragBehaviorWheel = null;

    let dragEnabledSolar = false;
    let dragEnabledWind = false;
    let dragEnabledWheel = false;

    let isRotatingSolar = false;
    let isRotatingWind = false;
    let isRotatingWheel = false;

    let startingX = null;

    const createScene = function () {
        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0.529, 0.808, 0.922, 1);

        const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 4, 10, new BABYLON.Vector3(0, 0, 0), scene);
        camera.attachControl(canvas, true);
        camera.upperRadiusLimit = 10;
        camera.lowerRadiusLimit = 3;

        new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

        function create3DLabel(text, position, scene) {
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

        create3DLabel("N", new BABYLON.Vector3(0, 0.5, -2.8), scene);
        create3DLabel("Z", new BABYLON.Vector3(0, 0, 2.8), scene);
        create3DLabel("O", new BABYLON.Vector3(-3, 0, -0.2), scene);
        create3DLabel("W", new BABYLON.Vector3(3, 0, -0.2), scene);

        BABYLON.SceneLoader.Append("", "environment.glb", scene, function () {});

        BABYLON.SceneLoader.ImportMesh("", "", "house.glb", scene, function (meshes) {
            const houseRoot = meshes.find(m => m.name === "__root__");
            if (houseRoot) {
                houseRoot.scaling = new BABYLON.Vector3(0.00009, 0.00009, 0.00009);
                houseRoot.position = new BABYLON.Vector3(0.92, 0, -0.225);
                houseRoot.rotation = new BABYLON.Vector3(0, -0.41, 0);
            }
        });

        BABYLON.SceneLoader.ImportMesh("", "", "windmill.glb", scene, function (meshes) {
            windmill = meshes.find(m => m.name === "__root__");
            if (windmill) {
                windmill.scaling = new BABYLON.Vector3(0.0022, 0.0022, 0.0022);
                windmill.position = new BABYLON.Vector3(-1.5, -0.05, 0);
                windmill.rotation = new BABYLON.Vector3(0, 0, 0);
                dragBehaviorWind = new BABYLON.PointerDragBehavior();
                dragBehaviorWind.useObjectOrientationForDragging = false;
                dragBehaviorWind.enabled = false;
                windmill.addBehavior(dragBehaviorWind);
            }
        });

        BABYLON.SceneLoader.ImportMesh("", "", "wheel.glb", scene, function (meshes) {
            wheel = meshes.find(m => m.name === "__root__");
            if (wheel) {
                wheel.scaling = new BABYLON.Vector3(0.15, 0.15, 0.15);
                wheel.position = new BABYLON.Vector3(1, 0.07, 0.7);
                wheel.rotation = new BABYLON.Vector3(0, 1, 0);
                dragBehaviorWheel = new BABYLON.PointerDragBehavior();
                dragBehaviorWheel.useObjectOrientationForDragging = false;
                dragBehaviorWheel.enabled = false;
                wheel.addBehavior(dragBehaviorWheel);
            }
        });

        BABYLON.SceneLoader.ImportMesh("", "", "solar.glb", scene, function (meshes) {
            solarPanel = meshes.find(m => m.name === "__root__");
            if (solarPanel) {
                solarPanel.scaling = new BABYLON.Vector3(0.02, 0.02, 0.02);
                solarPanel.position = new BABYLON.Vector3(1.12, 0.55, -0.6);
                solarPanel.rotation = new BABYLON.Vector3(0, 0, 0);
                dragBehaviorSolar = new BABYLON.PointerDragBehavior();
                dragBehaviorSolar.useObjectOrientationForDragging = false;
                dragBehaviorSolar.enabled = false;
                solarPanel.addBehavior(dragBehaviorSolar);
            }
        });

        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        function createInventoryPanel(titleText, topPadding) {
            const panel = new BABYLON.GUI.StackPanel();
            panel.width = "300px";
            panel.isVertical = true;
            panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            panel.paddingRight = "10px";
            panel.paddingTop = topPadding;
            advancedTexture.addControl(panel);

            const title = new BABYLON.GUI.TextBlock();
            title.text = titleText;
            title.height = "40px";
            title.color = "black";
            title.fontSize = "24px";
            title.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            panel.addControl(title);

            return panel;
        }

        function createInventoryItem(labelText, parentPanel) {
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

        // Solar Panel GUI
        const panelSolar = createInventoryPanel("zonnepaneel", "40px");
        const moveBtnSolar = createInventoryItem("Verplaats", panelSolar);
        const rotateBtnSolar = createInventoryItem("Draai", panelSolar);

        // Windmill GUI
        const panelWind = createInventoryPanel("windmolen", "240px");
        const moveBtnWind = createInventoryItem("Verplaats", panelWind);
        const rotateBtnWind = createInventoryItem("Draai", panelWind);

        // Wheel GUI
        const panelWheel = createInventoryPanel("rad", "400px");
        const moveBtnWheel = createInventoryItem("Verplaats", panelWheel);
        const rotateBtnWheel = createInventoryItem("Draai", panelWheel);

        // Button events: Solar
        moveBtnSolar.onPointerDownObservable.add(() => {
            if (!solarPanel || !dragBehaviorSolar) return;
            dragEnabledSolar = !dragEnabledSolar;
            dragBehaviorSolar.enabled = dragEnabledSolar;
            moveBtnSolar.background = dragEnabledSolar ? "#555" : "#333";
            if (dragEnabledSolar) {
                isRotatingSolar = false;
                rotateBtnSolar.background = "#333";
                camera.attachControl(canvas, true, false);
            }
        });

        rotateBtnSolar.onPointerDownObservable.add(() => {
            if (!solarPanel) return;
            isRotatingSolar = !isRotatingSolar;
            rotateBtnSolar.background = isRotatingSolar ? "#555" : "#333";
            if (isRotatingSolar) {
                dragEnabledSolar = false;
                dragBehaviorSolar.enabled = false;
                moveBtnSolar.background = "#333";
                camera.detachControl(canvas);
            } else {
                camera.attachControl(canvas, true, false);
            }
        });

        // Button events: Windmill
        moveBtnWind.onPointerDownObservable.add(() => {
            if (!windmill || !dragBehaviorWind) return;
            dragEnabledWind = !dragEnabledWind;
            dragBehaviorWind.enabled = dragEnabledWind;
            moveBtnWind.background = dragEnabledWind ? "#555" : "#333";
            if (dragEnabledWind) {
                isRotatingWind = false;
                rotateBtnWind.background = "#333";
                camera.attachControl(canvas, true, false);
            }
        });

        rotateBtnWind.onPointerDownObservable.add(() => {
            if (!windmill) return;
            isRotatingWind = !isRotatingWind;
            rotateBtnWind.background = isRotatingWind ? "#555" : "#333";
            if (isRotatingWind) {
                dragEnabledWind = false;
                dragBehaviorWind.enabled = false;
                moveBtnWind.background = "#333";
                camera.detachControl(canvas);
            } else {
                camera.attachControl(canvas, true, false);
            }
        });

        // Button events: Wheel
        moveBtnWheel.onPointerDownObservable.add(() => {
            if (!wheel || !dragBehaviorWheel) return;
            dragEnabledWheel = !dragEnabledWheel;
            dragBehaviorWheel.enabled = dragEnabledWheel;
            moveBtnWheel.background = dragEnabledWheel ? "#555" : "#333";
            if (dragEnabledWheel) {
                isRotatingWheel = false;
                rotateBtnWheel.background = "#333";
                camera.attachControl(canvas, true, false);
            }
        });

        rotateBtnWheel.onPointerDownObservable.add(() => {
            if (!wheel) return;
            isRotatingWheel = !isRotatingWheel;
            rotateBtnWheel.background = isRotatingWheel ? "#555" : "#333";
            if (isRotatingWheel) {
                dragEnabledWheel = false;
                dragBehaviorWheel.enabled = false;
                moveBtnWheel.background = "#333";
                camera.detachControl(canvas);
            } else {
                camera.attachControl(canvas, true, false);
            }
        });

        // Handle rotation dragging for all objects
        scene.onPointerObservable.add((pointerInfo) => {
            const processRotation = (object, conditionFlagSetter) => {
                switch (pointerInfo.type) {
                    case BABYLON.PointerEventTypes.POINTERDOWN:
                        startingX = pointerInfo.event.clientX;
                        break;
                    case BABYLON.PointerEventTypes.POINTERUP:
                        startingX = null;
                        break;
                    case BABYLON.PointerEventTypes.POINTERMOVE:
                        if (startingX !== null) {
                            const deltaX = pointerInfo.event.clientX - startingX;
                            object.rotation.y += deltaX * 0.005;
                            startingX = pointerInfo.event.clientX;
                        }
                        break;
                }
            };

            if (isRotatingSolar && solarPanel) return processRotation(solarPanel);
            if (isRotatingWind && windmill) return processRotation(windmill);
            if (isRotatingWheel && wheel) return processRotation(wheel);
        });

        return scene;
    };

    const scene = createScene();

    engine.runRenderLoop(() => scene.render());
    window.addEventListener('resize', () => engine.resize());
});
