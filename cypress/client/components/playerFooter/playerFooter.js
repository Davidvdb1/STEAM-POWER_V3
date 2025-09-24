//#region IMPORTS
import {componentBase} from "../../abstracts/componentBase.js";
import {define} from "../../abstracts/functionalBase.js";
import {getStyle, getTemplate} from "../../coreUtils/style.js";

//#endregion IMPORTS


//#region TEMPLATE
let template = await getTemplate("/components/playerFooter/playerFooter.html")
//#endregion TEMPLATE


//#region CLASS
define('player-footer-χ', class extends componentBase {
    async created() {
        this.shadow.appendChild(await getStyle('/components/playerFooter/playerFooter.css'));

    }
}, template);
//#endregion CLASS