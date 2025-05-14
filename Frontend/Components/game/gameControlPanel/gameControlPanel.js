//#region IMPORTS
//#endregion IMPORTS

//#region GAMECONTROLPANEL
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/game/gameControlPanel/style.css';
        .hidden { display: none; }

        html, body {
            margin: 0;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #222;
        }

        #game-container canvas {
            width: 800px;
            height: 456px;
            image-rendering: pixelated;
            border: 2px solid #555;
        }
    </style>

    <div>
        <label for="batteryInput">Batterijcapaciteit (Wh):</label>
        <input type="number" id="batteryInput" />
        <button id="confirmCapacityButton" class="hidden">Bevestig</button>
    </div>

    <div>
        <label for="multiplierInput">Energie-multiplier:</label>
        <input type="number" id="multiplierInput" step="0.01" />
        <button id="confirmMultiplierButton" class="hidden">Bevestig</button>
    </div>

    <div id="game-container"></div>

    <img id="card" src="Assets/images/hospitalGrey.png" draggable="false" alt="Draggable Card" />
`;
//#endregion GAMECONTROLPANEL

//#region CLASS
window.customElements.define('gamecontrolpanel-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ 'mode': 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));

        this.batteryInput = this._shadowRoot.querySelector('#batteryInput');
        this.confirmCapacityButton = this._shadowRoot.querySelector('#confirmCapacityButton');
        this.multiplierInput = this._shadowRoot.querySelector('#multiplierInput');
        this.confirmMultiplierButton = this._shadowRoot.querySelector('#confirmMultiplierButton');

        this.originalBatteryValue = null;
        this.originalMultiplierValue = null;

        this.onBatteryInputChange = this.onBatteryInputChange.bind(this);
        this.onConfirmBatteryClick = this.onConfirmBatteryClick.bind(this);
        this.onMultiplierInputChange = this.onMultiplierInputChange.bind(this);
        this.onConfirmMultiplierClick = this.onConfirmMultiplierClick.bind(this);
    }

    connectedCallback() {
        // Init battery capacity
        fetch(`${window.env.BACKEND_URL}/groups/battery`)
            .then(res => res.json())
            .then(data => {
                this.originalBatteryValue = parseInt(data);
                this.batteryInput.value = this.originalBatteryValue;
            })
            .catch(console.error);

        // Init energy multiplier
        fetch(`${window.env.BACKEND_URL}/groups/Multiplier`)
            .then(res => res.json())
            .then(data => {
                this.originalMultiplierValue = parseFloat(data);
                this.multiplierInput.value = this.originalMultiplierValue;
            })
            .catch(console.error);

        // Event listeners
        this.batteryInput.addEventListener('input', this.onBatteryInputChange);
        this.confirmCapacityButton.addEventListener('click', this.onConfirmBatteryClick);
        this.multiplierInput.addEventListener('input', this.onMultiplierInputChange);
        this.confirmMultiplierButton.addEventListener('click', this.onConfirmMultiplierClick);

        // Laad Phaser en start game
        this.loadPhaserAndStartGame();

        this.setupDraggableCard();

    }

    loadPhaserAndStartGame() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js';
        script.onload = () => this.startGame();
        this._shadowRoot.appendChild(script);
    }

    startGame() {
        const container = this._shadowRoot.querySelector('#game-container');

        class CityScene extends Phaser.Scene {
            preload() {
                this.load.image('citymap',     'Assets/images/citymap.png');
                this.load.image('hospitalGrey','Assets/images/hospitalGrey.png');
                this.load.image('powerplant',  'Assets/images/powerplant.png');
            }

            create() {
                const mapImg = this.textures.get('citymap').getSourceImage();
                const mapW = mapImg.width;
                const mapH = mapImg.height;

                this.scale.resize(mapW, mapH);
                this.add.image(0, 0, 'citymap').setOrigin(0);

                const hx = 106, hy = 189, hw = 240, hh = 240;
                this.add.image(hx + hw/2, hy + hh/2, 'hospitalGrey')
                    .setDisplaySize(hw, hh)
                    .setOrigin(0.5);

                const px = 953, py = 396, pw = 240, ph = 240;
                this.add.image(px + pw/2, py + ph/2, 'powerplant')
                    .setDisplaySize(pw, ph)
                    .setOrigin(0.5);
            }
        }

        new Phaser.Game({
            type: Phaser.AUTO,
            parent: container,
            width: 800,
            height: 456,
            scene: CityScene,
            backgroundColor: '#222',
            scale: {
                mode: Phaser.Scale.NONE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        });
    }

    onBatteryInputChange() {
        const current = parseInt(this.batteryInput.value);
        this.toggleButton(this.confirmCapacityButton, current !== this.originalBatteryValue);
    }

    onConfirmBatteryClick() {
        const newValue = parseInt(this.batteryInput.value);
        fetch(`${window.env.BACKEND_URL}/groups/battery`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ batteryCapacity: newValue })
        })
            .then(response => {
                if (!response.ok) throw new Error('Update failed');
                this.originalBatteryValue = newValue;
                this.confirmCapacityButton.classList.add('hidden');
            })
            .catch(console.error);
    }

    onMultiplierInputChange() {
        const current = parseFloat(this.multiplierInput.value);
        this.toggleButton(this.confirmMultiplierButton, current !== this.originalMultiplierValue);
    }

    onConfirmMultiplierClick() {
        const newValue = parseFloat(this.multiplierInput.value);
        fetch(`${window.env.BACKEND_URL}/groups/Multiplier`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ energyMultiplier: newValue })
        })
            .then(response => {
                if (!response.ok) throw new Error('Update failed');
                this.originalMultiplierValue = newValue;
                this.confirmMultiplierButton.classList.add('hidden');
            })
            .catch(console.error);
    }

    toggleButton(button, condition) {
        if (condition) {
            button.classList.remove('hidden');
        } else {
            button.classList.add('hidden');
        }
    }

setupDraggableCard() {
    let startX = 0, startY = 0;

    const card = this._shadowRoot.getElementById('card');
    const STEP = 30;

    card.addEventListener('mousedown', mouseDown);

    const mouseMove = (e) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let stepX = 0;
        let stepY = 0;

        if (Math.abs(dx) >= STEP) {
            stepX = dx > 0 ? STEP : -STEP;
            startX = e.clientX;
        }

        if (Math.abs(dy) >= STEP) {
            stepY = dy > 0 ? STEP : -STEP;
            startY = e.clientY;
        }

        if (stepX !== 0 || stepY !== 0) {
            const newTop = card.offsetTop + stepY;
            const newLeft = card.offsetLeft + stepX;

            card.style.top = `${newTop}px`;
            card.style.left = `${newLeft}px`;

            console.log(`Card positie: top=${newTop}px, left=${newLeft}px`);
        }
    };

    const mouseUp = () => {
        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', mouseUp);
    };

    function mouseDown(e) {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;

        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', mouseUp);
    }
}

});
//#endregion CLASS
