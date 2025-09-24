//#region IMPORTS
import {componentBase} from "../../abstracts/componentBase.js";
import {define} from "../../abstracts/functionalBase.js";
import {getStyle, getTemplate} from "../../coreUtils/style.js";

//#endregion IMPORTS


//#region TEMPLATE
let template = await getTemplate("/components/playerHeader/playerHeader.html")
//#endregion TEMPLATE


//#region CLASS
define('player-header-χ', class extends componentBase {
    async created() {
        this.shadow.appendChild(await getStyle('/components/playerHeader/playerHeader.css'));

    }
}, template);
//#endregion CLASS