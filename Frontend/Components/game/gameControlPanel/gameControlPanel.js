//gameControlPanel.js
// //#region IMPORTS
// No external JS imports needed; Phaser will be injected dynamically.
//#endregion IMPORTS

//#region GAMECONTROLPANEL
let template = document.createElement('template');
template.innerHTML = /*html*/`
  <style>
    @import './Components/game/gameControlPanel/style.css';
  </style>

  <!-- Canvas + Start button overlay -->
  <div id="wrapper">
    <div id="game-container"></div>
    <button id="startButton" class="hidden">Start</button>
  </div>

  <!-- Stats panel below canvas, hidden until Start -->
  <div id="stats" class="hidden">
    <div class="stat-item">
      <span class="label">Groene energie:</span>
      <span id="greenEnergy">0</span>
    </div>
    <div class="stat-item">
      <span class="label">Grijze energie:</span>
      <span id="greyEnergy">0</span>
    </div>
    <div class="stat-item">
      <span class="label">Coins:</span>
      <span id="coins">0</span>
    </div>
  </div>
`;
//#endregion GAMECONTROLPANEL

//#region CLASS
window.customElements.define('gamecontrolpanel-れ', class extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot     = this.attachShadow({ mode: 'open' });
    this._shadowRoot.appendChild(template.content.cloneNode(true));

    this._startButton    = this._shadowRoot.getElementById('startButton');
    this._statsContainer = this._shadowRoot.getElementById('stats');
    this._greenEl        = this._shadowRoot.getElementById('greenEnergy');
    this._greyEl         = this._shadowRoot.getElementById('greyEnergy');
    this._coinsEl        = this._shadowRoot.getElementById('coins');
  }

  connectedCallback() {
    this._loadPhaser().then(() => this._initializeGame());
    this._startButton.addEventListener('click', () => this._onStartClick());
  }

  _loadPhaser() {
    return new Promise(resolve => {
      if (window.Phaser) return resolve();
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js';
      s.onload = () => resolve();
      this._shadowRoot.appendChild(s);
    });
  }

  _initializeGame() {
    const container = this._shadowRoot.getElementById('game-container');
    const startBtn  = this._startButton;

    class LogoScene extends Phaser.Scene {
      constructor() { super('LogoScene'); }
      preload() {
        this.load.image('gameLogo', 'Assets/images/gameLogo.png');
      }
      create() {
        const { width, height } = this.sys.game.config;
        const img = this.textures.get('gameLogo').getSourceImage();
        const scale = Math.min(width / img.width, height / img.height);
        this.add.image(width/2, height/2, 'gameLogo')
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
        this.add.image(width/2, height/2, 'citymap')
          .setDisplaySize(width, height)
          .setOrigin(0.5);
      }
    }

    this._game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: container,
      width: 800,
      height: 456,
      scene: [ LogoScene, CityScene ],
      backgroundColor: '#9bd5e4',
      scale: { mode: Phaser.Scale.NONE, autoCenter: Phaser.Scale.CENTER_BOTH }
    });
  }

  async _onStartClick() {
    this._startButton.classList.add('hidden');
    this._game.scene.start('CityScene');

    await this._fetchStats();
    this._statsContainer.classList.remove('hidden');
  }

  async _fetchStats() {
    try {
      const raw = sessionStorage.getItem('loggedInUser');
      if (!raw) throw new Error('Not logged in');

      const parsed = JSON.parse(raw);
      const token   = parsed.token;
      const groupId = parsed.groupId;
      if (!token || !groupId) throw new Error('Invalid session data');

      const url = `${window.env.BACKEND_URL}/gameStatistics/group/${groupId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`Failed to load stats: HTTP ${res.status}`);
      }

      const gs  = await res.json();
      const cur = gs.currency;
      this._greenEl.textContent = cur.greenEnergy;
      this._greyEl.textContent  = cur.greyEnergy;
      this._coinsEl.textContent = cur.coins;
    } catch (e) {
      console.error('Error fetching stats:', e);
    }
  }
});
//#endregion CLASS
