//#region IMPORTS
import {componentBase} from "../../abstracts/componentBase.js";
import {define} from "../../abstracts/functionalBase.js";
import {getStyle, getTemplate} from "../../coreUtils/style.js";

import "../playerHeader/playerHeader.js";
import "../playerFooter/playerFooter.js";
import {keycloak} from "../../libs/auth.js";

//#endregion IMPORTS


//#region TEMPLATE
let template = await getTemplate("/components/scenario/scenario.html")
//#endregion TEMPLATE


//#region CLASS
define('scenario-χ', class extends componentBase {

    scenarioId;
    scenario;

    async created() {
        this.shadow.appendChild(await getStyle('/components/scenario/scenario.css'));
        await this.inject("scenario-service-χ", "scenarioService");

        let userInfo = keycloak.tokenParsed;
        this.$name.innerText = userInfo.given_name + " " + userInfo.family_name;
    }

    async startScenario(){
        this.scenarioId = this.getAttribute("scene-id");
        console.log("Starting Scenario...");
        console.log("Scene ID: " + this.scenarioId);
        this.scenario = await this.µScenarioService.getScenario(this.scenarioId);
        console.log("Scenario: ", this.scenario.toLocaleString());

        this.$nodeTitle.innerText = this.scenario.scenario.ChoiceNodes[0].Title;
    }

    stopScenario(){
        console.log("Stopping Scenario...");
        this.scenarioId = null;
        this.scenario = null;
        this.setAttribute("mode", "welcome");
    }
}, template);
//#endregion CLASS