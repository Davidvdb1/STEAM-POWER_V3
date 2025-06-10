/**
 * @module gameInstructionsOverlay
 * @description Handles the display of game instructions in the game
 */

/**
 * Creates and displays game instructions overlay
 *
 * @param {HTMLElement} wrapper - The wrapper element to attach the overlay to
 * @param {ShadowRoot} shadow - The shadow DOM root to append styles to
 * @returns {void}
 */
export function showGameInstructionsOverlay(wrapper, shadow) {
  try {
    // Get or create the overlay element
    const instructionsOverlay = getOrCreateOverlay(wrapper, shadow);

    // Show the overlay
    showOverlay(instructionsOverlay);
  } catch (error) {
    console.error("Error displaying game instructions:", error);
  }
}

/**
 * Gets the existing overlay or creates a new one if it doesn't exist
 *
 * @param {HTMLElement} wrapper - The wrapper element
 * @param {ShadowRoot} shadow - The shadow DOM root
 * @returns {HTMLElement} The instructions overlay element
 */
function getOrCreateOverlay(wrapper, shadow) {
  let instructionsOverlay = wrapper.querySelector(".instructions-overlay");

  // Create overlay container if it doesn't exist
  if (!instructionsOverlay) {
    instructionsOverlay = document.createElement("div");
    instructionsOverlay.className = "instructions-overlay";
    wrapper.appendChild(instructionsOverlay);

    // Add styles to shadow DOM
    ensureStylesExist(shadow);

    // Wire click handlers exactly once
    initOverlay(instructionsOverlay);
  }

  return instructionsOverlay;
}

/**
 * One-time initialization of the overlay's click handlers.
 * Prevents clicks through the backdrop and handles the close button.
 *
 * @param {HTMLElement} overlay
 */
function initOverlay(overlay) {
  // Block clicks on backdrop
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      e.stopPropagation();
    }
  });

  // Delegated close-button handler
  overlay.addEventListener("click", (e) => {
    if (e.target.matches(".close-button")) {
      overlay.classList.add("hidden");
    }
  });
}

/**
 * Ensures the styles for the instructions overlay exist in the shadow DOM
 *
 * @param {ShadowRoot} shadow - The shadow DOM root
 */
function ensureStylesExist(shadow) {
  if (shadow.querySelector("#instructions-overlay-styles")) {
    return; // Styles already exist
  }

  const style = document.createElement("style");
  style.id = "instructions-overlay-styles";
  style.textContent = getStylesText();
  shadow.appendChild(style);
}

/**
 * Returns the CSS styles for the instructions overlay
 *
 * @returns {string} The CSS text
 */
function getStylesText() {
  return `
    .instructions-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1500; /* Higher z-index to be above other UI elements */
      font-family: "PixelFont";
    }

    .instructions-panel {
      background-color: white;
      border-radius: 10px;
      width: 80%;
      max-width: 800px; /* Prevent oversized panel on large screens */
      height: 80%;
      max-height: 90vh; /* Prevent panel from being too tall */
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative; /* For absolute positioning of close button */
    }

    .instructions-header {
      background-color: #008000;
      color: white;
      padding: 15px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
    }

    .instructions-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      line-height: 1.5;
    }

    .instructions-footer {
      padding: 15px;
      text-align: center;
      border-top: 1px solid #ddd;
    }

    .close-button {
      background-color: #008000;
      color: white;
      border: none;
      border-radius: 5px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 16px;
      /* Position the close button in the center of the footer */
      display: block;
      margin: 0 auto;
      font-family: "PixelFont";
    }

    /* Hide the overlay while maintaining its existence */
    .instructions-overlay.hidden {
      display: none;
    }
  `;
}

/**
 * Shows the overlay and initializes its content
 *
 * @param {HTMLElement} overlay - The overlay element
 */
function showOverlay(overlay) {
  // Show the overlay (make sure to remove the hidden class if it exists)
  overlay.classList.remove("hidden");

  // Set the content
  overlay.innerHTML = createOverlayHTML();
}

/**
 * Creates the HTML for the overlay
 *
 * @returns {string} The HTML string
 */
function createOverlayHTML() {
  return `
    <div class="instructions-panel">
      <div class="instructions-header">SPELUITLEG</div>
      <div class="instructions-content">
        <p>Welkom bij STEAM-POWER! In dit spel bouw je een duurzame stad door slimme keuzes te maken over energieverbruik en -productie.</p>
        
        <h3>Hoe speel je:</h3>
        <p>1. <strong>Bouw je stad</strong> - Klik op gebouwen om ze aan te kopen en te beheren. Ieder gebouw heeft specifieke kosten en opbrengsten.</p>
        <p>2. <strong>Beheer je energie</strong> - Je kunt kiezen tussen grijze energie (goedkoper maar vervuilend) of groene energie (duurzamer maar duurder). Schakel gebouwen tussen deze opties door op de gebouwdetails te klikken.</p>
        <p>3. <strong>Produceer duurzame energie</strong> - Plaats windmolens, zonnepanelen en waterkrachtcentrales in de buitenstad om groene energie te produceren.</p>
        <p>4. <strong>Verzamel belastingen</strong> - Elke 5 minuten verzamel je belastinginkomsten. Een hogere luchtkwaliteit (score) levert meer belastinggeld op!</p>
        
        <h3>Tips:</h3>
        <p>• Houd je groene energieproductie in evenwicht met je verbruik</p>
        <p>• Let op je luchtkwaliteitsscore - deze beïnvloedt je belastinginkomsten</p>
        <p>• Verdien achievements door bepaalde doelen te bereiken</p>
        <p>• Sla je voortgang regelmatig op met de checkpoint-functie</p>
        
        <p>Veel plezier met het bouwen van jouw duurzame stad!</p>
      </div>
      <div class="instructions-footer">
        <button class="close-button">Sluiten</button>
      </div>
    </div>
  `;
}