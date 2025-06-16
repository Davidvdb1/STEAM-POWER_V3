const OPT_OFFSET = 15;        // ° optimaal

import { createSettingsPanel } from '../ui/settingsPanel.js';
import { createDataPanel } from '../ui/dataPanel.js';
import { loadModels, updateSunAndSolarPanel } from '../models/modelLoader.js';
import { createWindRoos } from '../ui/windRoos.js';
import {
  updateWindmillBlades,
  updateWindmillRotation,
  updateAutoRotateChange,
  updateWindmillModel
} from '../models/windmill.js';
import {
  updateSolarRotation,
  updateAutoRotateChangeSolar,
  calculateSolarPowerOutput
} from '../models/solarPanel.js';
import {
  updateWaterWheelDepth,
  updateWaterWheelPosition
} from '../models/waterWheel.js';
import { getSunPosition } from '../utils/sunCalculator.js';
import { postEnergyData } from '../utils/service.js'
import { geocodeAddress } from '../utils/geocode.js';
import {
  fetchWindSpeed,
  calcWindPowerWhTurbine,
  yawAdjustedSpeed,
  ROTOR_RADIUS_M,
  calcHydroPower
} from '../utils/weatherData.js';

let template = document.createElement('template');
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
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._shadowRoot.appendChild(template.content.cloneNode(true));

    this.street = "Geldenaaksebaan 335";
    this.city = "Leuven";
    this.postal = "3001";

    this.lat = 50.8798; // Default latitude for Leuven
    this.lon = 4.7005; // Default longitude for Leuven

    this.engine = null;
    this.scene = null;
    this.camera = null;
    this.resizeObserver = null;
    this.autoRotateEnabled = true;

    this.solarPanel = null;
    this.windmill = null;
    this.sunRoot = null;
    this.wheel = null;

    this.currentBladeCount = 3;
    this.manualYawDeg = OPT_OFFSET;
    this.modelVersion = 1;

    // Component state
    this.initialized = false;
    
    this.solarWatts = 0;
    this.windWatts = 0;
    this.waterWatts = 0;
    this.intervalId = null; // Store the interval ID

    this.currentWheelPosition = 1;
    this.currentWheelDepth    = 0;

    
  }

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;

    // Initialize the BabylonJS scene
        this._initializeBabylonJS();
        
        // Start the render loop
        this._startRenderLoop();
        
        // Set up resize observer for high resolution rendering
        this._setupResizeObserver();
        
        // Set up the interval to trigger every 2 seconds
        this._setupInterval();
    }
    
    disconnectedCallback() {

    }
    
    _setupInterval() {
        // Set up an interval that triggers every 2 seconds (2000 milliseconds)
        this.intervalId = setInterval(() => {
            this._calculateGeneratedEnergy();
        }, 2000);
    }
    
    _calculateGeneratedEnergy() {
        const groupId = JSON.parse(sessionStorage.getItem('loggedInUser'))?.groupId;

        // Calculate the total generated energy from all sources
        this.solarWatts = 0;
        this.windWatts = 0;
        this.waterWatts = 0;
        
        const time = new Date().toISOString();

        const energyData = [];
        energyData.push({ pin: 0, groupId, value: 500, type: 'SOLAR', time });
        energyData.push({ pin: 1, groupId, value: 200, type: 'WIND', time });
        energyData.push({ pin: 2, groupId, value: 100, type: 'WATER', time });
        energyData.forEach(async (data) => {
            if (data.value == 0) return;
            const response = await postEnergyData(data);
            const body = await response.json();
            const datapoint = body.energyData;

            // send event to rest of website
            const event = new CustomEvent('energydatareading', { detail: datapoint, bubbles: true, composed: true });
            document.dispatchEvent(event);
        });
    }

  _preventScroll = (event) => event.preventDefault();

  _customWheelHandler = (event) => {
    event.preventDefault();
    const delta = event.deltaY * 0.0005;
    this.camera.radius += delta * this.camera.radius;
    if (this.camera.radius > this.camera.upperRadiusLimit) {
      this.camera.radius = this.camera.upperRadiusLimit;
    }
    if (this.camera.radius < this.camera.lowerRadiusLimit) {
      this.camera.radius = this.camera.lowerRadiusLimit;
    }
  }

  _setupResizeObserver() {
    const container = this._shadowRoot.querySelector('.simulation-container');
    this.resizeObserver = new ResizeObserver(() => {
      this._updateCanvasSize();
      if (this.engine) this.engine.resize();
    });
    this.resizeObserver.observe(container);
    this._updateCanvasSize();
  }

  _updateCanvasSize() {
    const container = this._shadowRoot.querySelector('.simulation-container');
    const canvas = this._shadowRoot.getElementById('renderCanvas');
    if (container && canvas) {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    }
  }
_updateWaterEnergy(pos = this.currentWheelPosition,
                   depth = this.currentWheelDepth) {
  const { kW } = calcHydroPower(pos, depth);
 const Wh     = kW * 1000;                               // kW → Wh
 const disp   = Wh < 10 ? Wh.toFixed(1) : Wh.toFixed(0);
 console.log(`Water ${pos} | d=${depth.toFixed(2)} m → ${disp} Wh/u`);
 this.dataPanel?.setWaterValue?.(disp);
}


async _updateSolarEnergy(){
  console.log("aezfaef")
  const energySolar =  await calculateSolarPowerOutput(this.solarPanel,this.sunRoot);
  console.log("energySolar:", energySolar)
  this.dataPanel?.setSolarValue?.(energySolar);
}

  async _updateWindEnergy() {
  try {
    /* 1) windsnelheid en yaw-mismatch ---------------------------- */
    const v = await fetchWindSpeed(this.lat ?? 50.8798, this.lon ?? 4.7005);
    let delta = Math.abs(this.manualYawDeg % 360);
    if (delta > 180) delta = 360 - delta;

    /* 2) effectief v + vermogen ---------------------------------- */
    const vEff = yawAdjustedSpeed(v, delta);
    const Wh   = calcWindPowerWhTurbine(vEff, this.currentBladeCount);

    /* 3) adaptieve notatie ( <10 ⇒ 1 decimaal, anders geheel ) ---- */
    const dispWh = Wh < 10 ? Wh.toFixed(1) : Wh.toFixed(0);

    console.log(
      `Aantal ${this.currentBladeCount} wieken | Δ=${delta.toFixed(0)}° `
      + `→ ${dispWh} Wh/u`
    );

    /* 4) naar Data-paneel ---------------------------------------- */
    this.dataPanel?.setWindValue?.(dispWh);

  } catch (err) {
    console.error('Wind-energie-berekening faalde:', err);
  }
}

  async _updateSunAndSolarPanel(street, city, postal) {
    this.street = street;
    this.city = city;
    this.postal = postal;

    try {
      const { lat, lon } = await geocodeAddress(street, city, postal);
      this.lat = lat;
      this.lon = lon;
    } catch (err) {
      console.warn('Geocode faalde, behoud vorige coördinaten', err);
    }

    await updateSunAndSolarPanel(this, street, city, postal);
    await updateAutoRotateChange(this.scene, this, true, street, city, postal);
    await this._updateWindEnergy();
    await this._updateSolarEnergy();
  }

  async _initializeBabylonJS() {
    const canvas = this._shadowRoot.getElementById('renderCanvas');
    this.engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true
    });

    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(0.529, 0.808, 0.922, 1);

    this.camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 4, 10, new BABYLON.Vector3(0, 0, 0), this.scene);
    this.camera.wheelPrecision = 50;
    this.camera.inertia = 0.8;
    this.camera.panningSensibility = 1000;
    this.camera.angularSensibilityX = 1000;
    this.camera.angularSensibilityY = 1000;
    this.camera.attachControl(canvas, true);
    this.camera.upperRadiusLimit = 10;
    this.camera.lowerRadiusLimit = 3;

    new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), this.scene);

    this._create3DCompass(this.scene);

    createSettingsPanel(
      (bladeCount) => this._handleBladeCountChange(bladeCount),
      (street, city, postal) => this._updateSunAndSolarPanel(street, city, postal),
      (degrees) => this._handleWindmillRotation(degrees),
      (autoRotate) => this._handleAutoRotateChange(autoRotate),
      (degreesSolar) => this._handleSolarRotation(degreesSolar),
      (autoRotateSolar) => this._handleAutoRotateChangeSolar(autoRotateSolar),
      (position) => this._handleWaterWheelPosition(position),
      (depth) => this._handleWaterWheelDepth(depth),
      (pos, d)   => this._updateWaterEnergy(pos, d),
      (modelVersion) => this._handleWindmillModel(modelVersion)
      
    );

    this.dataPanel = createDataPanel();

    createWindRoos(45)

    await loadModels(this.scene, this);

    await this._updateSunAndSolarPanel(this.street, this.city, this.postal);
    
    

    this._updateWaterEnergy();  
    await this._updateWindEnergy();
    await this._updateSolarEnergy();
  
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
    this.currentBladeCount = bladeCount;
    await this._updateWindEnergy();
  }

  async _handleWindmillRotation(degrees) {
    await updateWindmillRotation(this.scene, this, degrees);
    this.manualYawDeg = degrees;
    await this._updateWindEnergy();
  }

  async _handleAutoRotateChange(enabled) {
  this.autoRotateEnabled = enabled;
  await updateAutoRotateChange(this.scene, this, enabled, this.street, this.city, this.postal);
  if (enabled) {
    // draai molen direct naar OPT_OFFSET tov de wind
    this.manualYawDeg = OPT_OFFSET;
    await updateWindmillRotation(this.scene, this, OPT_OFFSET);
    await this._updateWindEnergy();
  }
}

  async _handleSolarRotation(degreesSolar) {
    
    await updateSolarRotation(this.scene, this, degreesSolar);
    await this._updateSolarEnergy();
  }

  async _handleAutoRotateChangeSolar(enabledSolar) {
    await updateAutoRotateChangeSolar(this.scene, this, enabledSolar);
    await this._updateSolarEnergy();
  }

  // diepte
async _handleWaterWheelDepth(d) {
  await updateWaterWheelDepth(this.scene, this, d);
  this.currentWheelDepth = d;
  this._updateWaterEnergy();
}
// positie
async _handleWaterWheelPosition(p) {
  await updateWaterWheelPosition(this.scene, this, p);
  this.currentWheelPosition = p;
  this.currentWheelDepth = 0;
  this._updateWaterEnergy(p, 0);
}

  async _handleWindmillModel(modelVersion) {
    await updateWindmillModel(this.scene, this, modelVersion);
  }

}