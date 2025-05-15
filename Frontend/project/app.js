window.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true);

    const createScene = function () {
        const scene = new BABYLON.Scene(engine);

        // Camera
        const camera = new BABYLON.ArcRotateCamera("Camera", 
            Math.PI / 2, Math.PI / 3.5, 8,
            new BABYLON.Vector3(0, 0, 0), scene);
        camera.attachControl(canvas, true);

        // Light
        const light = new BABYLON.HemisphericLight("light", 
            new BABYLON.Vector3(1, 1, 0), scene);

        // Load Nature.glb
        BABYLON.SceneLoader.Append("", "Nature.glb", scene, function () {
            console.log("Nature.glb loaded");
        });

        BABYLON.SceneLoader.Append("", "Hot air balloon.glb", scene, function () {
            console.log("Hot air balloon.glb loaded");

            // Get all meshes from the scene
            scene.meshes.forEach(mesh => {
                console.log("Loaded mesh:", mesh.name);

                // If the hot air balloon has a root mesh or a recognizable part, transform it
                if (mesh.name === "__root__" || mesh.name.toLowerCase().includes("balloon")) {
                    // Resize the balloon (you can adjust this scaling factor as needed)
                    mesh.scaling = new BABYLON.Vector3(0.002, 0.002, 0.002); // Adjust scaling to make it smaller

                    // Move the balloon to a good location
                    mesh.position = new BABYLON.Vector3(-1, 1, -1.5); // Position the balloon

                    // Optionally, rotate the balloon if needed
                    mesh.rotation = new BABYLON.Vector3(-1.6, 0, 0); // Rotate it slightly

                    console.log(`Applied transform to ${mesh.name}`);
                }
            });
        });


        // Sun
        BABYLON.SceneLoader.ImportMesh("", "", "Sun with beams.glb", scene, function (meshes) {
            console.log("Sun.glb loaded");

            // Find the root mesh
            const sunRoot = meshes.find(m => m.name === "__root__");

            if (sunRoot) {
                sunRoot.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);      // Resize sun
                sunRoot.position = new BABYLON.Vector3(0.1, 1.3, -3);        // Move sun up and back
                sunRoot.rotation = new BABYLON.Vector3(0, 0.8, 0);
                console.log("Applied transform to Sun root");
            }

            // Optional: log meshes if you're debugging
            meshes.forEach(mesh => console.log("Sun mesh:", mesh.name));
        });

        BABYLON.SceneLoader.ImportMesh("", "", "Clouds.glb", scene, function (meshes) {
            console.log("Clouds.glb loaded");

            // Find the root mesh (if the clouds have a root mesh, adjust accordingly)
            const cloudsRoot = meshes.find(m => m.name === "__root__");

            if (cloudsRoot) {
                // Resize the clouds (make them smaller or larger)
                cloudsRoot.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);  // Adjust the scale as needed

                // Position the clouds in the scene
                cloudsRoot.position = new BABYLON.Vector3(1.5, 1.7, -3);      // Move clouds to a good location

                // Optionally, rotate the clouds if you want them to face a particular direction
                cloudsRoot.rotation = new BABYLON.Vector3(0, 0, 0); // Rotate around Y-axis

                console.log("Applied transform to Clouds root");
            }

            // Optional: log all parts of the clouds if needed for debugging
            meshes.forEach(mesh => console.log("Clouds mesh:", mesh.name));
        });

        BABYLON.SceneLoader.ImportMesh("", "", "Clouds.glb", scene, function (meshes) {
            console.log("Clouds.glb loaded");

            // Find the root mesh (if the clouds have a root mesh, adjust accordingly)
            const cloudsRoot = meshes.find(m => m.name === "__root__");

            if (cloudsRoot) {
                // Resize the clouds (make them smaller or larger)
                cloudsRoot.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);  // Adjust the scale as needed

                // Position the clouds in the scene
                cloudsRoot.position = new BABYLON.Vector3(-2.5, 1.8, -3);      // Move clouds to a good location

                // Optionally, rotate the clouds if you want them to face a particular direction
                cloudsRoot.rotation = new BABYLON.Vector3(0, 0, 0); // Rotate around Y-axis

                console.log("Applied transform to Clouds root");
            }

            // Optional: log all parts of the clouds if needed for debugging
            meshes.forEach(mesh => console.log("Clouds mesh:", mesh.name));
        });

        BABYLON.SceneLoader.ImportMesh("", "", "Clouds.glb", scene, function (meshes) {
            console.log("Clouds.glb loaded");

            // Find the root mesh (if the clouds have a root mesh, adjust accordingly)
            const cloudsRoot = meshes.find(m => m.name === "__root__");

            if (cloudsRoot) {
                // Resize the clouds (make them smaller or larger)
                cloudsRoot.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);  // Adjust the scale as needed

                // Position the clouds in the scene
                cloudsRoot.position = new BABYLON.Vector3(2.5, 1, -3);      // Move clouds to a good location

                // Optionally, rotate the clouds if you want them to face a particular direction
                cloudsRoot.rotation = new BABYLON.Vector3(0, 0, 0); // Rotate around Y-axis

                console.log("Applied transform to Clouds root");
            }

            // Optional: log all parts of the clouds if needed for debugging
            meshes.forEach(mesh => console.log("Clouds mesh:", mesh.name));
        });

        BABYLON.SceneLoader.ImportMesh("", "", "Clouds.glb", scene, function (meshes) {
            console.log("Clouds.glb loaded");

            // Find the root mesh (if the clouds have a root mesh, adjust accordingly)
            const cloudsRoot = meshes.find(m => m.name === "__root__");

            if (cloudsRoot) {
                // Resize the clouds (make them smaller or larger)
                cloudsRoot.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);  // Adjust the scale as needed

                // Position the clouds in the scene
                cloudsRoot.position = new BABYLON.Vector3(-1.5, 1.2, -3);      // Move clouds to a good location

                // Optionally, rotate the clouds if you want them to face a particular direction
                cloudsRoot.rotation = new BABYLON.Vector3(0, 0, 0); // Rotate around Y-axis

                console.log("Applied transform to Clouds root");
            }

            // Optional: log all parts of the clouds if needed for debugging
            meshes.forEach(mesh => console.log("Clouds mesh:", mesh.name));
        });


        BABYLON.SceneLoader.ImportMesh("", "", "windmill.glb", scene, function (meshes) {
            console.log("Tower Windmill.glb loaded");

            // Find the root mesh
            const windmillRoot = meshes.find(m => m.name === "__root__");

            if (windmillRoot) {
                // Resize the windmill
                windmillRoot.scaling = new BABYLON.Vector3(3.5, 3.5, 3.5);

                // Move the windmill to a good location
                windmillRoot.position = new BABYLON.Vector3(-1.5, 0, 0);

                // Rotate it to face a direction (adjust as needed)
                windmillRoot.rotation = new BABYLON.Vector3(0, 0.5, 0);

                console.log("Applied transform to Windmill root");
            }

            // Optional: log all parts of the windmill
            meshes.forEach(mesh => console.log("Windmill mesh:", mesh.name));
        });



        // Load House.glb
        BABYLON.SceneLoader.ImportMesh("", "", "House.glb", scene, function (meshes) {
            console.log("House.glb loaded");

            const houseRoot = meshes.find(m => m.name === "__root__");
            if (houseRoot) {
                houseRoot.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
                houseRoot.position = new BABYLON.Vector3(1, 0, -0.9);
                houseRoot.rotation = new BABYLON.Vector3(0, 0, 0);
                console.log("Applied transform to House root");
            }
        });

        BABYLON.SceneLoader.ImportMesh("", "", "Sail Boat.glb", scene, function (meshes) {
            console.log("Sail Boat.glb loaded");

            // Find the root mesh (if present) or filter based on name
            const boatRoot = meshes.find(m => m.name === "__root__" || m.name.toLowerCase().includes("boat"));

            if (boatRoot) {
                // Resize the sail boat
                boatRoot.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);  // Adjust scale as needed

                // Position the sail boat in your scene
                boatRoot.position = new BABYLON.Vector3(-0.7, -0.1, -0.6);      // Set position (X, Y, Z)

                // Optionally rotate it to face a direction
                boatRoot.rotation = new BABYLON.Vector3(0, 0.8, 0); // Rotate around Y axis

                console.log("Applied transform to Sail Boat root");
            }

            // Optional: log all meshes to inspect parts of the model
            meshes.forEach(mesh => console.log("Sail Boat mesh:", mesh.name));
        });

        BABYLON.SceneLoader.ImportMesh("", "", "logs.glb", scene, function (meshes) {
            console.log("logs.glb loaded");

            // Try to find the root mesh (either __root__ or name includes 'log')
            const logsRoot = meshes.find(m => m.name === "__root__" || m.name.toLowerCase().includes("log"));

            if (logsRoot) {
                // Scale the logs
                logsRoot.scaling = new BABYLON.Vector3(1, 1, 1); // Adjust size

                // Position the logs
                logsRoot.position = new BABYLON.Vector3(1.48, 0, -0.3); // Adjust location

                // Optional: rotate the logs
                logsRoot.rotation = new BABYLON.Vector3(0, 0, 0); // Rotate on Y-axis

                console.log("Applied transform to logs root");
            }

            // Debug: list all loaded mesh names
            meshes.forEach(mesh => console.log("Logs mesh:", mesh.name));
        });


        BABYLON.SceneLoader.ImportMesh("", "", "Well.glb", scene, function (meshes) {
            console.log("Well.glb loaded");

            // Find the root or relevant mesh by name
            const wellRoot = meshes.find(m => m.name === "__root__" || m.name.toLowerCase().includes("well"));

            if (wellRoot) {
                // Resize the well
                wellRoot.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);  // Scale down the well

                // Position the well somewhere in the scene
                wellRoot.position = new BABYLON.Vector3(0.3, 0, -0.5);     // Adjust X, Y, Z as needed

                // Optionally rotate the well if needed
                wellRoot.rotation = new BABYLON.Vector3(0, 1, 0); // Slight Y-axis rotation

                console.log("Applied transform to Well root");
            }

            // Optional: log all meshes for debugging
            meshes.forEach(mesh => console.log("Well mesh:", mesh.name));
        });

        // BABYLON.SceneLoader.ImportMesh("", "", "Horse.glb", scene, function (meshes) {
        //     console.log("Horse.glb loaded");

        //     // Find the root mesh (or a mesh that includes "horse" in the name)
        //     const horseRoot = meshes.find(m => m.name === "__root__" || m.name.toLowerCase().includes("horse"));

        //     if (horseRoot) {
        //         // Scale down the horse model
        //         horseRoot.scaling = new BABYLON.Vector3(0.032, 0.032, 0.032); // Adjust as needed

        //         // Position the horse somewhere in your scene
        //         horseRoot.position = new BABYLON.Vector3(1.7, -0.1, 0);     // X, Y, Z

        //         // Optionally rotate the horse to face a certain direction
        //         horseRoot.rotation = new BABYLON.Vector3(0, 1, 0); // Rotate on Y-axis

        //         console.log("Applied transform to Horse root");
        //     }

        //     // Log all mesh names for debugging
        //     meshes.forEach(mesh => console.log("Horse mesh:", mesh.name));
        // });

        BABYLON.SceneLoader.ImportMesh("", "", "watermill.glb", scene, function (meshes) {
            console.log("watermill.glb loaded");

            // Find the root mesh (or one that includes "watermill" in its name)
            const watermillRoot = meshes.find(m => m.name === "__root__" || m.name.toLowerCase().includes("watermill"));

            if (watermillRoot) {
                // Scale down the watermill
                watermillRoot.scaling = new BABYLON.Vector3(0.03, 0.03, 0.03); // Adjust scale as needed

                // Position the watermill in the scene
                watermillRoot.position = new BABYLON.Vector3(1, -0.08, 0.9);     // X, Y, Z position

                // Optional: rotate the watermill
                watermillRoot.rotation = new BABYLON.Vector3(0, -0.5, 0); // Rotate around Y axis

                console.log("Applied transform to Watermill root");
            }

            // Log mesh names to debug or explore the model structure
            meshes.forEach(mesh => console.log("Watermill mesh:", mesh.name));
        });


        return scene;
    };

    const scene = createScene();

    engine.runRenderLoop(function () {
        scene.render();
    });

    window.addEventListener('resize', function () {
        engine.resize();
    });
});
