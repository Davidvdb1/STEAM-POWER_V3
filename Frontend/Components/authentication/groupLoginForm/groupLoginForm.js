import {
  fetchGameStatistics,
  createGameStatistics,
  createGameBuildings,
} from "../../game/service/gameService.js";
//#region IMPORTS
//#endregion IMPORTS

//#region TEMPLATE
let template = document.createElement("template");
template.innerHTML = /*html*/ `
    <style>
        @import './Components/authentication/groupLoginForm/style.css';
    </style>
    <form class="group-login-form">
        <input type="text" name="code" placeholder="Code" required>
        <button type="submit">Aanmelden</button>
        <p class="error-message" style="display: none; color: red;"></p>
    </form>
`;
//#endregion TEMPLATE

//#region CLASS
window.customElements.define(
  "grouploginform-れ",
  class extends HTMLElement {
    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(template.content.cloneNode(true));
      this.errorMessageElement =
        this._shadowRoot.querySelector(".error-message");
    }

    // component attributes
    static get observedAttributes() {
      return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {}

    connectedCallback() {
      this._shadowRoot
        .querySelector(".group-login-form")
        .addEventListener("submit", this.handleSubmit.bind(this));
    }

    async handleSubmit(event) {
      event.preventDefault();

      this.errorMessageElement.style.display = "none";

      const form = event.target;
      const data = new FormData(form);
      const code = data.get("code");

      try {
        const response = await this.login(code);

        if (response.ok) {
          const data = await response.json();
          const token = data.JWT;
          sessionStorage.setItem("loggedInUser", JSON.stringify(token));
          this.dispatchEvent(
            new CustomEvent("tab", {
              bubbles: true,
              composed: true,
              detail: "campoverviewpage",
            })
          );

          try {
            const raw = sessionStorage.getItem("loggedInUser");
            if (!raw) throw new Error("Not logged in");

            const { token, groupId } = JSON.parse(raw);
            console.log(groupId)
            const gameStatistics = await fetchGameStatistics(groupId, token);

            if (!gameStatistics) {
              console.log(
                "GameStatistics bestaat nog niet, wordt aangemaakt..."
              );
              const created = await createGameStatistics(groupId, token);

              if (created && created.id) {
                console.log("GameStatistics succesvol aangemaakt");
                await createGameBuildings(created.id, token);
              } else {
                throw new Error("Aanmaken GameStatistics mislukt.");
              }
            } else {
              console.log("GameStatistics bestaat al.");
            }
          } catch (err) {
            console.error(err);
            this.errorMessageElement.textContent =
              "Inloggen mislukt. Probeer het opnieuw.";
            this.errorMessageElement.style.display = "block";
          }
        } else {
          const message = await response.json();
          this.errorMessageElement.textContent =
            message.error || "Inloggen mislukt. Probeer het opnieuw.";
          this.errorMessageElement.style.display = "block";
        }
      } catch {
        this.errorMessageElement.textContent =
          "Inloggen mislukt. Probeer het opnieuw.";
        this.errorMessageElement.style.display = "block";
      }
    }

    //service
    async login(code) {
      return await fetch(window.env.BACKEND_URL + "/groups/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
        }),
      });
    }
  }
);
//#endregion CLASS
