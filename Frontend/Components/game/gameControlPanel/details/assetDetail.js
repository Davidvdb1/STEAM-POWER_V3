// components/game/gameControlPanel/details/assetDetail.js

const template = document.createElement("template");
template.innerHTML = /*html*/`
  <style>
    @import './Components/game/gameControlPanel/details/style.css';
  </style>

  <button class="close">&times;</button>
  <div class="info">
    <p><span class="type"></span></p>
    <p>Energie: <span class="energy"></span></p>
    <p>Sloopkost: <span class="destroy-cost"></span> coins</p>
    <button class="destroy">Sloop</button>
  </div>
`;

class AssetDetail extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));

    this._closeBtn       = shadow.querySelector("button.close");
    this._typeEl         = shadow.querySelector(".type");
    this._energyEl       = shadow.querySelector(".energy");
    this._destroyCostEl  = shadow.querySelector(".destroy-cost");
    this._destroyBtn     = shadow.querySelector("button.destroy");
    this._data           = null;
  }

  // allow parent to set the Asset instance directly
  set data(value) {
    this._data = value;
    this._render();
  }

  get data() {
    return this._data;
  }

  connectedCallback() {
    // close panel
    this._closeBtn.addEventListener("click", () =>
      this.dispatchEvent(new CustomEvent("close-detail", { bubbles: true }))
    );

    // fallback if someone only set asset-id attribute
    const raw = this.getAttribute("asset-id");
    if (raw && !this._data) {
      const id = parseInt(raw, 10);
      if (!isNaN(id) && Array.isArray(window.phaserGame.assetData)) {
        const a = window.phaserGame.assetData.find(a => a.id === id);
        if (a) this.data = a;
      }
    }
  }

  _render() {
    if (!this._data) return;

    const { id, type, energy, destroyCost } = this._data;

    // expose type both in the DOM and as an attribute for styling
    this.setAttribute('type', type);
    this._typeEl.textContent         = type;

    // always show energy
    this._energyEl.textContent       = energy;
    // set destroy cost
    this._destroyCostEl.textContent  = destroyCost;

    // hook up destroy button
    this._destroyBtn.onclick = () => {
      this.dispatchEvent(new CustomEvent("destroy-asset", {
        detail: { assetId: id },
        bubbles: true
      }));
    };
  }
}

customElements.define("asset-detail", AssetDetail);
