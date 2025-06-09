/**
 * @module achievementOverview
 * @description Handles the display of achievements overview in the game
 */

import { getAuthFromSession } from "./sessionHelper.js";

/**
 * Creates and displays an overview of achievements
 *
 * @param {HTMLElement} wrapper - The wrapper element to attach the overview to
 * @param {ShadowRoot} shadow - The shadow DOM root to append styles to
 * @returns {Promise<void>}
 */
export async function showAchievementsOverview(wrapper, shadow) {
  try {
    const { token, groupId } = getAuthFromSession();

    // Get or create the overlay element
    const achievementsOverlay = getOrCreateOverlay(wrapper, shadow);

    // Show the overlay and initialize it
    showOverlay(achievementsOverlay);

    // Fetch and render achievements
    await fetchAndRenderAchievements(achievementsOverlay, groupId, token);
  } catch (error) {
    console.error("Error displaying achievements:", error);
    showErrorMessage(wrapper);
  }
}

/**
 * Gets the existing overlay or creates a new one if it doesn't exist
 *
 * @param {HTMLElement} wrapper - The wrapper element
 * @param {ShadowRoot} shadow - The shadow DOM root
 * @returns {HTMLElement} The achievements overlay element
 */
function getOrCreateOverlay(wrapper, shadow) {
  let achievementsOverlay = wrapper.querySelector(".achievements-overlay");

  // Create overlay container if it doesn't exist
  if (!achievementsOverlay) {
    achievementsOverlay = document.createElement("div");
    achievementsOverlay.className = "achievements-overlay";
    wrapper.appendChild(achievementsOverlay);

    // Add styles to shadow DOM
    ensureStylesExist(shadow);
  }

  return achievementsOverlay;
}

/**
 * Ensures the styles for the achievements overlay exist in the shadow DOM
 *
 * @param {ShadowRoot} shadow - The shadow DOM root
 */
function ensureStylesExist(shadow) {
  if (shadow.querySelector("#achievements-overlay-styles")) {
    return; // Styles already exist
  }

  const style = document.createElement("style");
  style.id = "achievements-overlay-styles";
  style.textContent = getStylesText();
  shadow.appendChild(style);
}

/**
 * Returns the CSS styles for the achievements overlay
 *
 * @returns {string} The CSS text
 */
function getStylesText() {
  return `
    .achievements-overlay {
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

    .achievements-panel {
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

    .achievements-header {
      background-color: #008000;
      color: white;
      padding: 15px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
    }

    .achievements-content {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
    }

    .achievement-item {
      background-color: #f0f0f0;
      border-radius: 8px;
      margin-bottom: 10px;
      padding: 12px;
      transition: all 0.2s ease;
    }

    .coin-icon {
      height: 18px;
      width: auto;
      vertical-align: middle;
      margin-bottom: 3px;
    }

    .achievement-completed {
      background-color: #4CAF50;
      color: white;
    }

    .achievement-header {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .achievement-description {
      font-size: 14px;
    }

    .achievements-footer {
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
    .achievements-overlay.hidden {
      display: none;
    }
  `;
}

/**
 * Shows the overlay and initializes its content with a loading state
 *
 * @param {HTMLElement} overlay - The overlay element
 */
function showOverlay(overlay) {
  // Show the overlay (make sure to remove the hidden class if it exists)
  overlay.classList.remove("hidden");

  // Initialize with loading state
  overlay.innerHTML = createOverlayHTML();

  // Setup event handlers
  setupEventHandlers(overlay);
}

/**
 * Creates the HTML for the overlay
 *
 * @returns {string} The HTML string
 */
function createOverlayHTML() {
  return `
    <div class="achievements-panel">
      <div class="achievements-header">DOELSTELLINGEN</div>
      <div class="achievements-content" id="achievements-content">
        <div style="text-align: center; padding: 20px;">Doelstellingen laden...</div>
      </div>
      <div class="achievements-footer">
        <button class="close-button">Sluiten</button>
      </div>
    </div>
  `;
}

/**
 * Sets up event handlers for the overlay
 *
 * @param {HTMLElement} overlay - The overlay element
 */
function setupEventHandlers(overlay) {
  // Add close handler
  const closeButton = overlay.querySelector(".close-button");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      overlay.classList.add("hidden");
    });
  }

  // Make the overlay block all events from passing through
  overlay.addEventListener("click", (e) => {
    // Only prevent propagation if the click is directly on the overlay
    // and not on a child element
    if (e.target === overlay) {
      e.stopPropagation();
    }
  });
}

/**
 * Fetches achievements data and renders it in the overlay
 *
 * @param {HTMLElement} overlay - The overlay element
 * @param {string} groupId - The group ID
 * @param {string} token - The authentication token
 */
async function fetchAndRenderAchievements(overlay, groupId, token) {
  // Fetch achievements
  const { getAchievementsOverviewByGroupId } = await import(
    "../service/gameService.js"
  );
  const achievements = await getAchievementsOverviewByGroupId(groupId, token);

  // Get the content element
  const contentEl = overlay.querySelector("#achievements-content");
  if (!contentEl) return;

  // Handle empty achievements
  if (!achievements || achievements.length === 0) {
    contentEl.innerHTML = createEmptyAchievementsHTML();
    return;
  }

  // Render achievements
  contentEl.innerHTML = createAchievementsListHTML(achievements);
}

/**
 * Creates HTML for when no achievements are found
 *
 * @returns {string} The HTML string
 */
function createEmptyAchievementsHTML() {
  return '<div style="text-align: center; padding: 20px;">Geen doelstellingen gevonden</div>';
}

/**
 * Creates HTML for the list of achievements
 *
 * @param {Array} achievements - The achievements data
 * @returns {string} The HTML string
 */
function createAchievementsListHTML(achievements) {
  return achievements
    .map((achievement) => createAchievementItemHTML(achievement))
    .join("");
}

/**
 * Creates HTML for a single achievement item
 *
 * @param {Object} achievement - The achievement data
 * @returns {string} The HTML string
 */
function createAchievementItemHTML(achievement) {
  return `
    <div class="achievement-item ${
      achievement.isReached ? "achievement-completed" : ""
    }">
      <div class="achievement-header">
        <div>${achievement.title} (+${
    achievement.reward
  } <img class="coin-icon" src="Assets/images/pixelCoin.png" alt="coins"/>)</div>
        ${achievement.isReached ? "<div>✓</div>" : ""}
      </div>
      <div class="achievement-description">${achievement.description}</div>
    </div>
  `;
}

/**
 * Shows an error message in the overlay
 *
 * @param {HTMLElement} wrapper - The wrapper element
 */
function showErrorMessage(wrapper) {
  const achievementsOverlay = wrapper.querySelector(".achievements-overlay");
  if (!achievementsOverlay) return;

  const contentEl = achievementsOverlay.querySelector("#achievements-content");
  if (!contentEl) return;

  contentEl.innerHTML =
    '<div style="text-align: center; color: red; padding: 20px;">Fout bij het laden van doelstellingen</div>';
}
