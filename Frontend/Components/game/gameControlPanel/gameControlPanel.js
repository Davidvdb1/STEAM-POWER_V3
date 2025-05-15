// components/game/gameControlPanel/gameControlPanel.js

import { createLogoScene      } from '../scenes/logoScene.js';
import { createCityScene      } from '../scenes/cityScene.js';
import { createOuterCityScene } from '../scenes/outerCityScene.js';
import { fetchStats           } from '../utils/fetchStats.js';

const template = document.createElement('template');
template.innerHTML = /*html*/`
  <style>
    @import './Components/game/gameControlPanel/style.css';
  </style>

  <div id="wrapper">
    <div id="game-container"></div>

    <div id="outer-container">
      <img id="outer-button" src="Assets/images/toOuter.png" alt="Ga naar buitenstad" />
      <div id="outer-text">Ga naar buitenstad</div>
    </div>

    <button id="startButton" class="hidden">Start</button>
  </div>

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
    this._shadow        = this.attachShadow({ mode: 'open' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this._wrapper       = this._shadow.getElementById('wrapper');
    this._startButton   = this._shadow.getElementById('startButton');
    this._outerContainer= this._shadow.getElementById('outer-container');
    this._outerButton   = this._shadow.getElementById('outer-button');
    this._statsContainer= this._shadow.getElementById('stats');
    this._greenEl       = this._shadow.getElementById('greenEnergy');
    this._greyEl        = this._shadow.getElementById('greyEnergy');
    this._coinsEl       = this._shadow.getElementById('coins');

    // hide outer until city
    this._outerContainer.style.display = 'none';
  }

  connectedCallback() {
    this._startButton.addEventListener('click',    () => this._onStartClick());
    this._outerButton.addEventListener('click',   () => this._transitionToOuterCity());
    this._loadPhaser().then(() => this._initializeGame());
  }

  _loadPhaser() {
    return new Promise(resolve => {
      if (window.Phaser) return resolve();
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js';
      s.onload = () => resolve();
      this._shadow.appendChild(s);
    });
  }

  _initializeGame() {
    const LogoScene      = createLogoScene(this._startButton);
    const CityScene      = createCityScene();
    const OuterCityScene = createOuterCityScene();

    this._game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: this._shadow.getElementById('game-container'),
      width: 800,
      height: 456,
      scene: [ LogoScene, CityScene, OuterCityScene ],
      backgroundColor: '#9bd5e4',
      scale: { mode: Phaser.Scale.NONE, autoCenter: Phaser.Scale.CENTER_BOTH }
    });
  }

  async _onStartClick() {
    this._startButton.classList.add('hidden');
    this._game.scene.start('CityScene');
    this._outerContainer.style.display = 'flex';

    try {
      const raw        = sessionStorage.getItem('loggedInUser');
      if (!raw) throw new Error('Not logged in');
      const { token, groupId } = JSON.parse(raw);
      const gs         = await fetchStats(groupId, token);
      const cur        = gs.currency;
      this._greenEl.textContent = cur.greenEnergy;
      this._greyEl.textContent  = cur.greyEnergy;
      this._coinsEl.textContent = cur.coins;
      this._statsContainer.classList.remove('hidden');
    } catch (e) {
      console.error('Error fetching stats:', e);
    }
  }

  _transitionToOuterCity() {
    // Slide the entire wrapper
    const w = this._wrapper;
    w.style.transition = 'transform 0.5s ease';
    w.style.transform  = 'translateX(-800px)';

    w.addEventListener('transitionend', () => {
      // switch scenes
      this._game.scene.start('OuterCityScene');

      // snap offscreen right
      w.style.transition = 'none';
      w.style.transform  = 'translateX(800px)';
      void w.offsetWidth; // force reflow

      // slide back to center
      w.style.transition = 'transform 0.5s ease';
      w.style.transform  = 'translateX(0)';
    }, { once: true });
  }
});
