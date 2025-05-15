// components/game/gameControlPanel/gameControlPanel.js

import { createLogoScene      } from '../scenes/logoScene.js';
import { createCityScene      } from '../scenes/cityScene.js';
import { createOuterCityScene } from '../scenes/outerCityScene.js';  // correct casing
import { fetchStats           } from '../utils/fetchStats.js';

const template = document.createElement('template');
template.innerHTML = /*html*/`
  <style>
    @import './Components/game/gameControlPanel/style.css';
  </style>

  <div id="wrapper">
    <!-- Inner button (to go back), hidden until in outer scene -->
    <div id="inner-container">
      <img id="inner-button" src="Assets/images/toInner.png" alt="Ga naar binnenstad" />
      <div id="inner-text">Ga naar binnenstad</div>
    </div>

    <div id="game-container"></div>

    <!-- Outer button (to go out), shown in city scene -->
    <div id="outer-container">
      <img id="outer-button" src="Assets/images/toOuter.png" alt="Ga naar buitenstad" />
      <div id="outer-text">Ga naar buitenstad</div>
    </div>

    <button id="startButton" class="hidden">Start</button>
  </div>

  <div id="stats" class="hidden">
    <div class="stat-item"><span class="label">Groene energie:</span><span id="greenEnergy">0</span></div>
    <div class="stat-item"><span class="label">Grijze energie:</span><span id="greyEnergy">0</span></div>
    <div class="stat-item"><span class="label">Coins:</span><span id="coins">0</span></div>
  </div>
`;

window.customElements.define('gamecontrolpanel-れ', class extends HTMLElement {
  constructor() {
    super();
    this._shadow        = this.attachShadow({ mode: 'open' });
    this._shadow.appendChild(template.content.cloneNode(true));

    this._wrapper        = this._shadow.getElementById('wrapper');
    this._startButton    = this._shadow.getElementById('startButton');
    this._innerContainer = this._shadow.getElementById('inner-container');
    this._innerButton    = this._shadow.getElementById('inner-button');
    this._outerContainer = this._shadow.getElementById('outer-container');
    this._outerButton    = this._shadow.getElementById('outer-button');
    this._statsContainer = this._shadow.getElementById('stats');
    this._greenEl        = this._shadow.getElementById('greenEnergy');
    this._greyEl         = this._shadow.getElementById('greyEnergy');
    this._coinsEl        = this._shadow.getElementById('coins');

    // initial visibility
    this._outerContainer.style.display = 'none';
    this._innerContainer.style.display = 'none';
  }

  connectedCallback() {
    this._startButton.addEventListener('click',    () => this._onStartClick());
    this._outerButton.addEventListener('click',   () => this._transitionToOuterCity());
    this._innerButton.addEventListener('click',   () => this._transitionToCity());
    this._loadPhaser().then(() => this._initializeGame());
  }

  _loadPhaser() {
    return new Promise(res => {
      if (window.Phaser) return res();
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js';
      s.onload = () => res();
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
      scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    });
  }

  async _onStartClick() {
    this._startButton.classList.add('hidden');
    this._game.scene.start('CityScene');
    this._outerContainer.style.display = 'flex';
    this._innerContainer.style.display = 'none';

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

  _transitionToOuterCity() {
    // slide wrapper left, then switch to OuterCityScene and show inner-button
    this._animateWrapper(-800, () => {
      this._game.scene.start('OuterCityScene');
      this._outerContainer.style.display = 'none';
      this._innerContainer.style.display = 'flex';
    });
  }

  _transitionToCity() {
    // slide wrapper right, then switch back to CityScene and show outer-button
    this._animateWrapper(800, () => {
      this._game.scene.start('CityScene');
      this._innerContainer.style.display = 'none';
      this._outerContainer.style.display = 'flex';
    });
  }

  _animateWrapper(offsetX, onComplete) {
    const w = this._wrapper;
    w.style.transition = 'transform 0.5s ease';
    w.style.transform  = `translateX(${offsetX}px)`;

    w.addEventListener('transitionend', () => {
      onComplete();

      // snap to opposite side
      w.style.transition = 'none';
      w.style.transform  = `translateX(${-offsetX}px)`;
      void w.offsetWidth; // reflow

      // slide back to center
      w.style.transition = 'transform 0.5s ease';
      w.style.transform  = 'translateX(0)';
    }, { once: true });
  }
});
