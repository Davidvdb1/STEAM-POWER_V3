//#region IMPORTS
import {componentBase} from "../../abstracts/componentBase.js";
import {define} from "../../abstracts/functionalBase.js";
import {getStyle, getTemplate} from "../../coreUtils/style.js";

import "../playerHeader/playerHeader.js";
import "../playerFooter/playerFooter.js";
import "../carousel/carousel.js";
import "../card/card.js";
import {keycloak} from "../../libs/auth.js";

//#endregion IMPORTS


//#region TEMPLATE
let template = await getTemplate("/components/sceneSelector/sceneSelector.html")
//#endregion TEMPLATE


//#region CLASS
define('scene-selector-χ', class extends componentBase {
    async created() {
        this.shadow.appendChild(await getStyle('/components/sceneSelector/sceneSelector.css'));

        let userInfo = keycloak.tokenParsed;
        this.$name.innerText = userInfo.given_name + " " + userInfo.family_name;

        //TODO populate carousel with cards


    }

    goBack() {
        this.setAttribute("mode", "welcome");
    }

    setSelectedScene() {
        let index = this.$carousel.getAttribute("slide-index")
        let sceneId = this.$carousel.slides[index]?.getAttribute("scene-id");
        console.log("Selected sceneId: " + sceneId);
        this.setAttribute("selectedScene", sceneId);
        this.setAttribute("mode", "singlePlayer-start");
    }
}, template);
//#endregion CLASS