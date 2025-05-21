// components/game/gameControlPanel/details/assetDetail.js

const template = document.createElement("template");
template.innerHTML = /*html*/`
  <style>
    :host {
      position: absolute;
      top: 16px;
      left: 16px;
      width: 220px;
      background: white;
      border: 1px solid #333;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      padding: 8px;
      z-index: 10;
    }
    button.close {
      align-self: flex-end;
      background: none;
      border: none;
      font-size: 1.2em;
      cursor: pointer;
    }
    .content {
      flex: 1;
      /* empty for now */
    }
  </style>
  <button class="close">&times;</button>
  <div class="content">
    <!-- asset details go here later -->
  </div>
`;

class AssetDetail extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).appendChild(template.content.cloneNode(true));
    this._closeBtn = this.shadowRoot.querySelector("button.close");
  }

  connectedCallback() {
    this._closeBtn.addEventListener("click", () =>
      this.dispatchEvent(new CustomEvent("close-detail", { bubbles: true }))
    );
  }
}

customElements.define("asset-detail", AssetDetail);
