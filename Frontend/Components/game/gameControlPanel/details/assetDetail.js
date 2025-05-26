const template = document.createElement("template");
template.innerHTML = /*html*/`
  <style>
    @import './Components/game/gameControlPanel/details/style.css';
  </style>

  <button class="close">&times;</button>
  <div class="info">
    <p><span class="type"></span></p>
    <p class="energy-row">Energie: <span class="energy"></span></p>
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
    this._energyRow      = shadow.querySelector(".energy-row");
    this._energyEl       = shadow.querySelector(".energy");
    this._destroyCostEl  = shadow.querySelector(".destroy-cost");
    this._destroyBtn     = shadow.querySelector("button.destroy");
    this._infoContainer  = shadow.querySelector(".info");
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

    // zet het type-attribuut op de host voor styling
    this.setAttribute('type', type);

    // vul de velden
    this._typeEl.textContent        = type;
    this._destroyCostEl.textContent = destroyCost;

    // check of het een nature-asset is
    const natureTypes = ['eik','beuk','buxus','hulst'];
    if (natureTypes.includes(type.toLowerCase())) {
      // verberg energie-rij
      this._energyRow.style.display = 'none';
      // geef achtergrond lichtblauw
      this._infoContainer.classList.add('nature');
    } else {
      // toon energie-rij normaal
      this._energyRow.style.display = '';
      this._energyEl.textContent = energy;
      this._infoContainer.classList.remove('nature');
    }

    // destroy-button koppelen
    this._destroyBtn.onclick = () => {
      this.dispatchEvent(new CustomEvent("destroy-asset", {
        detail: { assetId: id },
        bubbles: true
      }));
    };
  }
}

customElements.define("asset-detail", AssetDetail);
