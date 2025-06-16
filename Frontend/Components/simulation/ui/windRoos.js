export function createWindRoos(angleDegrees = 0) {
    const GUI = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    const outerCircle = new BABYLON.GUI.Ellipse();
    outerCircle.width = "250px";
    outerCircle.height = "250px";
    outerCircle.color = "white";
    outerCircle.thickness = 4;          
    outerCircle.background = "black";
    outerCircle.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    outerCircle.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    outerCircle.paddingTop = "70px"
    outerCircle.paddingLeft = "70px"
    GUI.addControl(outerCircle);

    // Add white dot in the center
    const centerDot = new BABYLON.GUI.Ellipse();
    centerDot.width = "12px";
    centerDot.height = "12px";
    centerDot.color = "white";
    centerDot.thickness = 0;
    centerDot.background = "white";
    centerDot.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    centerDot.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    outerCircle.addControl(centerDot);

    const arrowLine = new BABYLON.GUI.Rectangle();
    arrowLine.width = "5px";
    arrowLine.height = "130px";  
    arrowLine.background = "white";
    outerCircle.addControl(arrowLine);

    const arrowLine2 = new BABYLON.GUI.Rectangle();
    arrowLine2.width = "5px";
    arrowLine2.height = "15px";  
    arrowLine2.background = "red";
    arrowLine2.color = "red"
    arrowLine2.top = "-57px"; // Move it to top end of 130px line (half height = 65px)
    arrowLine2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    arrowLine2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

    arrowLine.addControl(arrowLine2);

    const angleRadians = angleDegrees * (Math.PI / 180);
    arrowLine.rotation = angleRadians;

    const north = new BABYLON.GUI.TextBlock();
    north.text = "N";
    north.fontSize = 25;
    north.color = "white";
    north.height = "30px";
    north.width = "30px";
    north.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    north.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    north.left = "145px";
    north.top = "34px";
    GUI.addControl(north);

    const north2 = new BABYLON.GUI.TextBlock();
    north2.text = "Z";
    north2.fontSize = 25;
    north2.color = "white";
    north2.height = "30px";
    north2.width = "30px";
    north2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    north2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    north2.left = "145px";
    north2.top = "260px";
    GUI.addControl(north2);

    const north3 = new BABYLON.GUI.TextBlock();
    north3.text = "O";
    north3.fontSize = 25;
    north3.color = "white";
    north3.height = "30px";
    north3.width = "30px";
    north3.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    north3.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    north3.left = "255px";
    north3.top = "150px";
    GUI.addControl(north3);

    const north4 = new BABYLON.GUI.TextBlock();
    north4.text = "W";
    north4.fontSize = 25;
    north4.color = "white";
    north4.height = "30px";
    north4.width = "30px";
    north4.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    north4.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    north4.left = "30px";
    north4.top = "150px";
    GUI.addControl(north4);
}