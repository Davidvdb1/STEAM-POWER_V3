// src/utils/checkpointLoadPopup.js

import { fetchGameStatistics, getCheckpointsByGameStatisticsId } from "../service/gameService.js";

export function createCheckpointLoadPopup(scene) {
  // 1) create the overlay container
  const container = document.createElement("div");
  Object.assign(container.style, {
    position:    "absolute",
    zIndex:      1000,
    top:         "50%",
    left:        "50%",
    transform:   "translate(-50%, -50%)",
    background:  "rgba(0, 0, 0, 0.9)",
    padding:     "20px",
    borderRadius:"8px",
    display:     "none",
    color:       "#fff",
    maxHeight:   "60%",
    overflowY:   "auto",
    minWidth:    "300px",
  });
  document.body.appendChild(container);

  /**
   * Shows a list of checkpoints as buttons.
   * @param {(selectedId: string) => void} callback 
   */
  scene.showCheckpointList = async function(callback) {
    container.innerHTML = "";  // clear previous

    // Title
    const title = document.createElement("p");
    title.textContent = "Selecteer een checkpoint om te laden:";
    title.style.marginBottom = "12px";
    container.appendChild(title);

    // 2) load credentials & statsId
    const raw = sessionStorage.getItem("loggedInUser");
    if (!raw) {
      container.appendChild(createMessage("Niet ingelogd", "red"));
      container.style.display = "block";
      return;
    }
    let creds;
    try {
      creds = JSON.parse(raw);
    } catch (err) {
      container.appendChild(createMessage("Fout bij inlezen gebruiker", "red"));
      container.style.display = "block";
      return;
    }
    const { groupId, token } = creds;

    // 3) re-fetch statistics to get the up-to-date stats ID
    let stats;
    try {
      stats = await fetchGameStatistics(groupId, token);
    } catch (err) {
      container.appendChild(createMessage("Fout bij ophalen gameStats", "red"));
      container.style.display = "block";
      return;
    }
    const statsId = stats.id;

    // 4) fetch checkpoints
    let checkpoints;
    try {
      checkpoints = await getCheckpointsByGameStatisticsId(statsId, token);
    } catch (err) {
      container.appendChild(createMessage("Fout bij laden van checkpoints", "red"));
      container.style.display = "block";
      return;
    }

    if (!Array.isArray(checkpoints) || checkpoints.length === 0) {
      container.appendChild(createMessage("Geen checkpoints gevonden", "#ccc"));
      container.style.display = "block";
      return;
    }

    // 5) render buttons
    checkpoints.forEach(cp => {
      const btn = document.createElement("button");
      btn.textContent = cp.name || cp.id;
      Object.assign(btn.style, {
        display: "block",
        width:   "100%",
        padding: "8px",
        margin:  "6px 0",
        fontSize:"16px",
        cursor:  "pointer",
      });
      btn.onclick = () => {
        container.style.display = "none";
        callback(cp.id);
      };
      container.appendChild(btn);
    });

    container.style.display = "block";
  };

  function createMessage(text, color) {
    const p = document.createElement("p");
    p.textContent = text;
    p.style.color = color;
    p.style.margin = "8px 0";
    return p;
  }
}
