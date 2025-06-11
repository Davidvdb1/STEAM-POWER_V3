/**
 * @module gameInstructionsOverlay
 * @description Handles the display of game instructions in the game
 */

/**
 * Creates and displays game instructions overlay
 *
 * @function showGameInstructionsOverlay
 * @memberof gameInstructionsOverlay
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
 * @function getOrCreateOverlay
 * @memberof gameInstructionsOverlay
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
 * @function initOverlay
 * @memberof gameInstructionsOverlay
 * @param {HTMLElement} overlay - The overlay element to initialize
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
 * @function ensureStylesExist
 * @memberof gameInstructionsOverlay
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
 * @function getStylesText
 * @memberof gameInstructionsOverlay
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
      margin: 0;
    }

    .instructions-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      line-height: 1.5;
    }

    .instructions-content * {
      margin: 0;
      padding: 0;
    }

    /* Heading styles with proper spacing */
    .instructions-content h3 {
      margin-top: 24px;
      margin-bottom: 6px;
      color: #008000;
    }
    
    .instructions-content h3 + h4 {
      margin-top: 0px;
      margin-bottom: 4px;
      color: #006600;
    }

    .instructions-content h4 {
      margin-top: 16px;
      margin-bottom: 4px;
      color: #006600;
    }

    /* The first heading should have less top margin */
    .instructions-content h3:first-child,
    .instructions-content h4:first-child {
      margin-top: 0;
    }
    
    /* Paragraph spacing */
    .instructions-content p {
      margin-bottom: 8px;
    }
    
    /* List spacing */
    .instructions-content ul, 
    .instructions-content ol {
      margin-left: 20px;
      margin-bottom: 12px;
    }
    
    .instructions-content li {
      margin-bottom: 4px;
    }
    
    /* Space between sections */
    .instructions-content h3 + ul,
    .instructions-content h3 + ol,
    .instructions-content h4 + ul,
    .instructions-content h4 + ol {
      margin-top: 6px;
    }

    /* Style the coin icon */
    .coin-icon {
      height: 24px;
      width: 24px;
      margin-right: 0px;
      vertical-align: middle;
      display: inline;
    }

    /* Style the energy icons */
    .energy-icon {
      height: 48px;
      width: 48px;
      margin-right: -16px;
      margin-left: -16px;
      margin-top: -16px;
      margin-bottom: -16px;
      vertical-align: middle;
      display: inline;
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
 * @function showOverlay
 * @memberof gameInstructionsOverlay
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
        <p>Welkom bij EcoCity Quest, een spel waarin je bijleert over belangrijke concepten zoals duurzaamheid, hernieuwbare energie en klimaatbewustzijn!</p>
        
        <h3>Het Doel van het spel</h3>
        <p>Bouw een stad die zowel economisch succesvol als ecologisch verantwoord is.</p>

        <h3>Valuta in het spel</h3>
        <p>Het spel heeft verschillende valuta die je moet beheren:</p>
        <ul>
          <li>
            <img src="Assets/images/pixelCoin.png" class="coin-icon" alt="Coins" />
            <strong>Coins</strong> - De basis munteenheid waarmee je gebouwen upgradet, energiebronnen aanschaft en natuurelementen plaatst.
          </li>
          <li>
            <img src="Assets/images/pixelGreenEnergy.svg" class="energy-icon" alt="Green Energy" />
            <strong>Groene Energie (kWh)</strong> - Hernieuwbare energie die door duurzame bronnen zoals windmolens, zonnepanelen en waterraderen wordt opgewekt. Hoe meer groene energie, hoe beter voor je luchtkwaliteit.
          </li>
          <li>
            <img src="Assets/images/pixelGreyEnergy.svg" class="energy-icon" alt="Grey Energy" />
            <strong>Grijze Energie (kW)</strong> - Conventionele energie die vervuilend is maar minder kost. Hoe meer grijze energie, hoe lager je luchtkwaliteitsscore.
          </li>
          <li>
            <strong>Luchtkwaliteit (score)</strong> - Een indicatie voor hoe schoon je stad is. Hoe hoger je luchtkwaliteit, hoe meer mensen de stad aantrekt en hoe meer belastingsgeld je ontvangt.
          </li>
        </ul>

        <h3>Stadsopbouw</h3>
        <p>Je stad bestaat uit twee belangrijke zones:</p>
        <ul>
          <li><strong>Binnenstad</strong> - Dit is waar alle gebouwen zoals huizen, bedrijven en diensten zich bevinden. Hier kun je gebouwen upgraden om ze energiezuiniger te maken.</li>
          <li><strong>Buitenstad</strong> - In dit gebied kun je energiebronnen plaatsen (windmolens, zonnepanelen, waterraderen, kerncentrales) en natuurelementen zoals bomen en struiken planten om je luchtkwaliteit te verbeteren.</li>
        </ul>

        <h3>Energiebronnen / Natuurelementen</h3>
        <h4>Groene energiebronnen</h4>
        <p> Deze bronnen produceren hernieuwbare energie en verbeteren de luchtkwaliteit elk met 1 punt. 
        Per geplaatste groene energiebron wordt je groene energieproductie verhoogd met een bepaalde factor die je rechtsonder op het scherm kan bekijken</p>

        <h4>Grijze energiebronnen</h4>
        <p> Deze bronnen produceren conventionele energie, maar verminderen de luchtkwaliteit elk met 2 punten.
        Elke kerncentrale produceert 250 kW grijze energie.</p>

        <h4>Natuurelementen</h4>
        <p>Deze elementen verbeteren de luchtkwaliteit en dragen bij aan een gezondere stad.
        De luchtkwaliteitsverbetering varieert per type element:</p>
        <ul>
          <li><strong>Eik</strong> +3 punten.</li>
          <li><strong>Beuk</strong> +4 punten.</li>
          <li><strong>Buxus</strong> +2 punt.</li>
          <li><strong>Hulst</strong> +1 punt.</li>
        </ul>

        <h4>Externe factoren met invloed op energieproductie</h4>
        <p>De energieproductie van hernieuwbare bronnen is afhankelijk van enkele externe factoren:</p>
        <ul>
          <li><strong>Hagelstorm</strong> - De zonnepanelen worden tijdelijk minder effectief (x0,8), maar de waterwielen draaien iets harder (x1,2).</li>
          <li><strong>Regenstorm</strong> - De zonnepanelen worden tijdelijk minder actief (x0,6), maar de waterwielen draaien harder (x1,5).</li>
          <li><strong>Windvlaag</strong> - De windmolens draaien harder (x1,5) en leveren meer energie op.</li>
          <li><strong>Zonneschijn</strong> - De zonnepanelen zijn tijdelijk actiever (x1,5), maar de waterwielen krijgen last van de droogte (x0,8).</li>
          <li><strong>Stroomstoring</strong> - Door een stroomstoring wordt de energieproductie van elke energiebron tijdelijk verlaagd (x0,8).</li>
          <li><strong>Vervuiling</strong> - Door vervuiling in de rivier draaien de waterwielen trager (x0,7).</li>
        </ul>

        <h3>Belastingen en inkomsten</h3>
        <h4>Schulden</h4>
        <p>Als stad kun je leningen aangaan en schulden maken. Er staat een limiet op 100 coins aan schulden (-100 coins).</p>
        <p>Let wel op: als je saldo onder de 0 coins komt, dan betaal je een boete van 10% coins op elke uitgave.</p>

        <h4>Belastingen</h4>
        <p>Elke 5 minuten verzamel je belastinginkomsten van de inwoners van je stad. De formule is: 10 coins (basisbedrag) + luchtkwaliteitsscore.</p>
        <p>Een hogere luchtkwaliteit betekent dat meer mensen in je stad willen wonen, wat leidt tot hogere belastinginkomsten.</p>

        <h4>Inkomsten</h4>
        <p>Er zijn verschillende manieren om inkomsten te genereren:</p>
        <ul>
          <li><strong>Belastingen</strong> - Elke 5 minuten ontvang je belastinginkomsten gebaseerd op je luchtkwaliteitsscore.</li>
          <li><strong>Subsidies</strong> - Behaal doelstellingen die gericht zijn op duurzaamheid om extra coins te verdienen.</li>
          <li><strong>Quizvragen</strong> - Beantwoord quizvragen over duurzaamheid en energie om extra coins te verdienen.</li>
        </ul>

        <h3>Energieproductie vs energieverbruik</h3>
        <p>Het is heel belangrijk om een goede balans te vinden tussen energieproductie en energieverbruik.</p>
        <p>Als je meer groene energie verbruikt dan je produceert, dan worden alle gebouwen automatisch terug omgeschakeld naar grijze energie.</p>
        <p>Als je ook niet meer genoeg grijze energie hebt, dan moet je extra betalen om energie aan te kopen en krijg je maar 50% van je belastingsinkomsten omdat de inwoners last hadden van een stroompanne.</p>
        <p>Als je niet meer genoeg coins hebt om energie aan te kopen, dan ligt je stad volledig zonder stroom en vluchten alle inwoners. Je moet in dit geval het spel opnieuw beginnen</p>

        <h3>Hoe speel je:</h3>
        <p>1. <strong>Bheer je binnenstad</strong> - Upgrade gebouwen zodat ze energiezuiniger zijn. Elk gebouw heeft specifieke kosten en energieverbruik.</p>
        <p>2. <strong>Beheer je energie</strong> - Kies tussen grijze energie (goedkoper maar vervuilend) of groene energie (duurder maar schoon). Schakel gebouwen tussen deze opties via de gebouwdetails.</p>
        <p>3. <strong>Produceer duurzame energie</strong> - Plaats windmolens, zonnepanelen en waterraderen in de buitenstad om groene energie te produceren. Let op: deze hebben wisselende opbrengsten gebaseerd op natuurlijke factoren!</p>
        <p>4. <strong>Plant bomen en natuur</strong> - Verbeter je luchtkwaliteit door natuurelementen zoals bomen en struiken te plaatsen die CO2 absorberen.</p>
        <p>5. <strong>Verzamel belastingen</strong> - Elke 5 minuten verzamel je belastinginkomsten. De formule is: 10 coins (basisbedrag) + je luchtkwaliteitsscore. Een hogere luchtkwaliteit levert dus meer inkomsten op!</p>
        <p>6. <strong>Behaal doelstellingen</strong> - Verdien extra coins (subsidies) door doelstellingen te halen die gericht zijn op duurzaamheid. Je vindt meer info over de doelstellingen op de menupagina.</p>

        <h3>Link met de Echte Wereld</h3>
        <p>EcoCity Quest is niet alleen een spel, maar ook een leermiddel om te begrijpen hoe duurzaamheid in de echte wereld werkt:</p>

        <h4>Klimaatverandering</h4>
        <p>In het spel ervaar je hoe de keuze voor grijze energie de luchtkwaliteit verslechtert, net zoals in de echte wereld waar fossiele brandstoffen bijdragen aan klimaatverandering. 
        Door te kiezen voor groene energie in het spel, leer je over de positieve impact die hernieuwbare energie kan hebben op het milieu en op de samenleving.</p>

        <h4>Energietransitie</h4>
        <p>Je ervaart de uitdagingen van de energietransitie: groene energie is initieel duurder maar beter voor het milieu op lange termijn. Dit weerspiegelt de echte uitdagingen bij het overschakelen naar duurzame energiebronnen.</p>

        <h4>Economische Impact</h4>
        <p>Het belastingsysteem in het spel demonstreert hoe een schonere omgeving economische voordelen kan opleveren, vergelijkbaar met hoe duurzame steden in de werkelijkheid aantrekkelijker zijn voor bewoners en bedrijven.</p>

        <h4>Natuurlijke Variabiliteit</h4>
        <p>De wisselende opbrengst van windmolens, zonnepanelen en waterraderen simuleert de echte uitdagingen van hernieuwbare energie: de wind waait niet altijd, de zon schijnt niet 's nachts, en waterstanden kunnen variëren. Dit leert je over de noodzaak van een gevarieerde energiemix.</p>

        <h4>Europese Doelstellingen</h4>
        <p>Sommige doelstellingen in het spel zijn gebaseerd op echte EU-richtlijnen voor hernieuwbare energie en CO2-reductie, waardoor je inzicht krijgt in internationale klimaatakkoorden.</p>

        <h3>Tips:</h3>
        <ul>
          <li>Diversifieer je energiebronnen voor een stabiele energievoorziening</li>
          <li>Investeer vroeg in het spel in hernieuwbare energiebronnen voor voordelen op lange termijn</li>
          <li>Let op je luchtkwaliteitsscore, die beïnvloedt direct je belastinginkomsten</li>
          <li>Upgrade gebouwen om hun energie-efficiëntie te verbeteren</li>
          <li>Sla regelmatig je voortgang op met de checkpoint-functie</li>
        </ul>

        <p>Veel plezier met het bouwen van jullie duurzame stad, en vergeet niet: de keuzes die je maakt in het spel zijn een vereenvoudigde versie van de echte uitdagingen waarmee we als samenleving worden geconfronteerd in onze strijd tegen klimaatverandering!</p>
      </div>
      <div class="instructions-footer">
        <button class="close-button">Sluiten</button>
      </div>
    </div>
  `;
}