const template = document.createElement("template");
template.innerHTML = /*html*/`
  <style>
    @import "/Components/game/gameControlPanel/details/style.css";
  </style>

  <button class="close">&times;</button>
  <div class="info">
    <p>Type: <span class="type"></span></p>
    <p>Energy: <span class="energy"></span></p>
    <button class="destroy">
      Sloop (<span class="destroy-cost"></span> coins)
    </button>
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
    this._destroyBtn     = shadow.querySelector("button.destroy");
    this._destroyCostEl  = shadow.querySelector(".destroy-cost");
    this._data           = null;
  }

  set data(value) {
    this._data = value;
    this._render();
  }

  get data() {
    return this._data;
  }

  connectedCallback() {
    this._closeBtn.addEventListener("click", () =>
      this.dispatchEvent(new CustomEvent("close-detail", { bubbles: true }))
    );

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

    // expose type for styling
    this.setAttribute('type', type);
    this._typeEl.textContent = type;

    this._energyEl.textContent      = energy;
    this._destroyCostEl.textContent = destroyCost;

    this._destroyBtn.onclick = () => {
      this.dispatchEvent(new CustomEvent("destroy-asset", {
        detail: { assetId: id },
        bubbles: true
      }));
    };
  }
}

customElements.define("asset-detail", AssetDetail);