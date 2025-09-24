//#region IMPORTS
import {define} from "../../abstracts/functionalBase.js";
import {componentBase} from "../../abstracts/componentBase.js";
import {getStyle, getTemplate} from "../../coreUtils/style.js";
//#endregion IMPORTS


//#region TEMPLATE
let template  = await getTemplate("/components/secretInfo/secretInfo.html")
//#endregion TEMPLATE


//#region CLASS
define('secret-info-ɮ', class extends componentBase {

    async created() {
        this.shadow.appendChild(await getStyle("/components/secretInfo/secretInfo.css"));
    }

}, template);
//#endregion CLASS