//#region IMPORTS
// No external JS imports needed; Phaser will be injected dynamically.
//#endregion IMPORTS

//#region GAMECONTROLPANEL
let template = document.createElement('template');
template.innerHTML = /*html*/`
    <style>
        @import './Components/game/gameControlPanel/style.css';
    </style>
    <div id="wrapper">
      <div id="game-container"></div>
      <button id="startButton" class="hidden">Start</button>
    </div>
`;
//#endregion GAMECONTROLPANEL

//#region CLASS
window.customElements.define('gamecontrolpanel-れ', class extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this._startButton = this._shadowRoot.getElementById('startButton');
    }

    connectedCallback() {
        this._loadPhaser().then(() => this._createGame());
    }

    _loadPhaser() {
        return new Promise(resolve => {
            if (window.Phaser) {
                resolve();
            } else {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js';
                script.onload = () => resolve();
                this._shadowRoot.appendChild(script);
            }
        });
    }

    _createGame() {
        const container = this._shadowRoot.getElementById('game-container');
        const startBtn = this._startButton;

        class LogoScene extends Phaser.Scene {
            constructor() { super('LogoScene'); }
            preload() {
                this.load.image('gameLogo', 'Assets/images/gameLogo.png');
            }
            create() {
                const { width, height } = this.sys.game.config;
                const img = this.textures.get('gameLogo').getSourceImage();
                const scale = Math.min(width / img.width, height / img.height);
                this.add.image(width / 2, height / 2, 'gameLogo')
                    .setDisplaySize(img.width * scale, img.height * scale)
                    .setOrigin(0.5);
                startBtn.classList.remove('hidden');
            }
        }

        class CityScene extends Phaser.Scene {
            constructor() { super('CityScene'); }
            preload() {
                this.load.image('citymap', 'Assets/images/citymap.png');
            }
            create() {
                const { width, height } = this.sys.game.config;
                this.add.image(width / 2, height / 2, 'citymap')
                    .setDisplaySize(width, height)
                    .setOrigin(0.5);
            }
        }

        this._game = new Phaser.Game({
            type: Phaser.AUTO,
            parent: container,
            width: 800,
            height: 456,
            scene: [LogoScene, CityScene],
            backgroundColor: '#9bd5e4',
            scale: {
                mode: Phaser.Scale.NONE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        });

        startBtn.addEventListener('click', () => {
            startBtn.classList.add('hidden');
            this._game.scene.start('CityScene');
        });
    }
});
//#endregion CLASS
