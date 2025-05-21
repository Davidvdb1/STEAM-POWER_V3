// components/game/gameControlPanel/details/assetDetail.js
const template = document.createElement("template");
template.innerHTML = /*html*/`
  <style>
    @import "./style.scss";
  </style>

  <button class="close">&times;</button>
  <div class="info">
    <!-- fill in asset fields as needed -->
    <p>Type: <span class="asset-type"></span></p>
    <p>Output: <span class="asset-output"></span> kWh</p>
  </div>
`;

class AssetDetail extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" })
        .appendChild(template.content.cloneNode(true));

    this._closeBtn = this.shadowRoot.querySelector("button.close");
    this._typeEl   = this.shadowRoot.querySelector(".asset-type");
    this._outEl    = this.shadowRoot.querySelector(".asset-output");
  }

  connectedCallback() {
    this._closeBtn.addEventListener("click", () =>
      this.dispatchEvent(new CustomEvent("close-detail", { bubbles: true }))
    );

    const id = this.getAttribute("asset-id");
    if (!id) return;
    const data = window.phaserGame.assetData[id];
    this._typeEl.textContent   = data.type;
    this._outEl.textContent    = data.currentOutput;
  }
}

customElements.define("asset-detail", AssetDetail);
