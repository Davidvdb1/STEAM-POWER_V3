//#region IMPORTS
import {componentBase} from "../../abstracts/componentBase.js";
import {define} from "../../abstracts/functionalBase.js";
import {getStyle, getTemplate} from "../../coreUtils/style.js";

import "../../components/welcome/welcome.js"
import "../../components/sceneSelector/sceneSelector.js"
import "../../components/scenario/scenario.js"
//#endregion IMPORTS


//#region TEMPLATE
let template = await getTemplate("/pages/player/player.html")
//#endregion TEMPLATE

//#region CLASS
define('player-χ', class extends componentBase {

    async created() {
        let self = this;

        this.shadow.appendChild(await getStyle('/pages/player/player.css'));

        await this.inject(`scenario-service-χ`, "scenarioService");

        const list = await this.µScenarioService.listScenarios();
        const doc = list?.[0];
        console.log(doc);


        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes') {
                    if (mutation.attributeName === "mode")
                    {
                        let mode = mutation.target.attributes.getNamedItem(mutation.attributeName).value;
                        console.log(mode)
                        if (mode === "welcome")
                        {
                            self.$welcome.removeAttribute("hidden");
                            self.$sceneSelector.setAttribute("hidden", "true");
                            self.$scenario.setAttribute("hidden", "true");
                        } else if (mode === "singlePlayer")
                        {
                            self.$sceneSelector.removeAttribute("hidden");
                            self.$welcome.setAttribute("hidden", "true");
                            self.$scenario.setAttribute("hidden", "true");
                        } else if (mode === "singlePlayer-start"){
                            //Start the scenario
                            this.$scenario.removeAttribute("hidden");
                            self.$sceneSelector.setAttribute("hidden", "true");
                            self.$welcome.setAttribute("hidden", "true");

                            let selectedScene = self.$sceneSelector.getAttribute("selectedScene")
                            self.$scenario.setAttribute("scene-id", selectedScene);
                            self.$scenario.startScenario();
                        }
                    }


                }
            });
        });

        observer.observe(this.shadow, {
            subtree: true,          // watch descendants
            childList: true,        // watch children added/removed
            attributes: true        // watch attribute changes
        });

        // Save observer if you want to disconnect later
        this._observer = observer;
    }


    async destroyed() {
        this._observer?.disconnect();
    }


}, template);
//#endregion CLASS