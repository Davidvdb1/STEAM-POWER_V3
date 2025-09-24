//#region IMPORTS
import { define } from "../../abstracts/functionalBase.js";
import { componentBase } from "../../abstracts/componentBase.js";
import "../../components/pageWrapper/pageWrapper.js"
import {getStyle, getTemplate} from "../../coreUtils/style.js";
//#endregion IMPORTS


//#region TEMPLATE
let template = await getTemplate("/pages/denied/denied.html")
//#endregion TEMPLATE


//#region CLASS
define('denied-ɦ', class extends componentBase {

    async created() {
        this.shadow.appendChild(await getStyle('/style/global.css'));
        this.shadow.appendChild(await getStyle('/pages/denied/denied.css'));
    }

}, template);
//#endregion CLASS