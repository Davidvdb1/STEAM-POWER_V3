/**
 * @module gameadminpanel
 * @description
 *   The administrative panel for adjusting battery capacity and energy multiplier.
 */

//#region IMPORTS
//#endregion IMPORTS

//#region GAMEADMINPANEL
let template = document.createElement("template");
template.innerHTML = /*html*/ `
    <style>
        @import './Components/game/gameAdminPanel/style.css';
        .hidden { display: none; }
    </style>

    <div>
        <label for="batteryInput">Batterijcapaciteit (Wh):</label>
        <input type="number" id="batteryInput" />
        <button id="confirmCapacityButton" class="hidden">Bevestig</button>
    </div>

    <div>
        <label for="multiplierInput">Energie-multiplier:</label>
        <input type="number" id="multiplierInput" step="0.01" />
        <button id="confirmMultiplierButton" class="hidden">Bevestig</button>
    </div>
`;
//#endregion GAMEADMINPANEL

//#region CLASS
window.customElements.define(
  "gameadminpanel-れ",
  class extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(template.content.cloneNode(true));

      this.batteryInput = this._shadowRoot.querySelector("#batteryInput");
      this.confirmCapacityButton = this._shadowRoot.querySelector(
        "#confirmCapacityButton"
      );
      this.multiplierInput = this._shadowRoot.querySelector("#multiplierInput");
      this.confirmMultiplierButton = this._shadowRoot.querySelector(
        "#confirmMultiplierButton"
      );

      this.originalBatteryValue = null;
      this.originalMultiplierValue = null;

      this.onBatteryInputChange = this.onBatteryInputChange.bind(this);
      this.onConfirmBatteryClick = this.onConfirmBatteryClick.bind(this);
      this.onMultiplierInputChange = this.onMultiplierInputChange.bind(this);
      this.onConfirmMultiplierClick = this.onConfirmMultiplierClick.bind(this);
    }

    /**
     * Called when the element is added to the DOM.
     * Initializes battery capacity and energy multiplier values, and sets up event listeners.
     * @returns {void}
     */
    connectedCallback() {
      // Init battery capacity
      fetch(`${window.env.BACKEND_URL}/groups/battery`)
        .then((res) => res.json())
        .then((data) => {
          this.originalBatteryValue = parseInt(data);
          this.batteryInput.value = this.originalBatteryValue;
        })
        .catch(console.error);

      // Init energy multiplier
      fetch(`${window.env.BACKEND_URL}/groups/Multiplier`)
        .then((res) => res.json())
        .then((data) => {
          this.originalMultiplierValue = parseFloat(data);
          this.multiplierInput.value = this.originalMultiplierValue;
        })
        .catch(console.error);

      // Event listeners
      this.batteryInput.addEventListener("input", this.onBatteryInputChange);
      this.confirmCapacityButton.addEventListener(
        "click",
        this.onConfirmBatteryClick
      );
      this.multiplierInput.addEventListener(
        "input",
        this.onMultiplierInputChange
      );
      this.confirmMultiplierButton.addEventListener(
        "click",
        this.onConfirmMultiplierClick
      );
    }

    /**
     * Called when the element is removed from the DOM.
     * Cleans up event listeners.
     * @returns {void}
     */
    disconnectedCallback() {
      this.batteryInput.removeEventListener("input", this.onBatteryInputChange);
      this.confirmCapacityButton.removeEventListener(
        "click",
        this.onConfirmBatteryClick
      );
      this.multiplierInput.removeEventListener(
        "input",
        this.onMultiplierInputChange
      );
      this.confirmMultiplierButton.removeEventListener(
        "click",
        this.onConfirmMultiplierClick
      );
    }

    /**
     * Handles changes to the battery input field.
     * Enables or disables the confirm button based on whether the value has changed.
     * @returns {void}
     */
    onBatteryInputChange() {
      const current = parseInt(this.batteryInput.value);
      this.toggleButton(
        this.confirmCapacityButton,
        current !== this.originalBatteryValue
      );
    }

    /**
     * Handles the confirmation click for battery capacity.
     * Sends a PUT request to update the battery capacity.
     * @returns {void}
     * @throws {Error} If the update fails.
     */
    onConfirmBatteryClick() {
      const newValue = parseInt(this.batteryInput.value);
      fetch(`${window.env.BACKEND_URL}/groups/battery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batteryCapacity: newValue }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Update failed");
          this.originalBatteryValue = newValue;
          this.confirmCapacityButton.classList.add("hidden");
        })
        .catch(console.error);
    }

    /**
     * Handles changes to the multiplier input field.
     * Enables or disables the confirm button based on whether the value has changed.
     * @return {void}
     * @throws {Error} If the input is not a valid number.
     * */
    onMultiplierInputChange() {
      const current = parseFloat(this.multiplierInput.value);
      this.toggleButton(
        this.confirmMultiplierButton,
        current !== this.originalMultiplierValue
      );
    }

    /**
     * Handles the confirmation click for the energy multiplier.
     * Sends a PUT request to update the energy multiplier.
     * @return {void}
     * @throws {Error} If the update fails.
     * */
    onConfirmMultiplierClick() {
      const newValue = parseFloat(this.multiplierInput.value);
      fetch(`${window.env.BACKEND_URL}/groups/Multiplier`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ energyMultiplier: newValue }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Update failed");
          this.originalMultiplierValue = newValue;
          this.confirmMultiplierButton.classList.add("hidden");
        })
        .catch(console.error);
    }

    /**
     * Toggles the visibility of a button based on a condition.
     * @param {HTMLElement} button - The button to toggle.
     * @param {boolean} condition - If true, the button is shown; if false, it is hidden.
     * @return {void}
     */
    toggleButton(button, condition) {
      if (condition) {
        button.classList.remove("hidden");
      } else {
        button.classList.add("hidden");
      }
    }
  }
);
//#endregion CLASS
