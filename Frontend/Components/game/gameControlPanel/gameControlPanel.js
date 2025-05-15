// components/game/gameControlPanel/gameControlPanel.js

import { createLogoScene } from '../scenes/logoScene.js';
import { createCityScene  } from '../scenes/cityScene.js';
import { fetchStats      } from '../utils/fetchStats.js';

const template = document.createElement('template');
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
      <span class="label">Groene energie:</span><span id="greenEnergy">0</span>
    </div>
    <div class="stat-item">
      <span class="label">Grijze energie:</span><span id="greyEnergy">0</span>
    </div>
    <div class="stat-item">
      <span class="label">Coins:</span><span id="coins">0</span>
    </div>
  </div>
`;

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
    this._startButton.addEventListener('click', () => this._onStartClick());
    this._loadPhaser().then(() => this._initializeGame());
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

    const LogoScene = createLogoScene(startBtn);
    const CityScene = createCityScene();

    this._game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: container,
      width: 800,
      height: 456,
      scene: [ LogoScene, CityScene ],
      backgroundColor: '#9bd5e4',
      scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    });
  }

  async _onStartClick() {
    this._startButton.classList.add('hidden');
    this._game.scene.start('CityScene');

    try {
      const raw = sessionStorage.getItem('loggedInUser');
      if (!raw) throw new Error('Not logged in');

      const { token, groupId } = JSON.parse(raw);
      const gs = await fetchStats(groupId, token);
      const cur = gs.currency;

      this._greenEl.textContent = cur.greenEnergy;
      this._greyEl.textContent  = cur.greyEnergy;
      this._coinsEl.textContent = cur.coins;
      this._statsContainer.classList.remove('hidden');
    } catch (e) {
      console.error('Error fetching stats:', e);
    }
  }
});
