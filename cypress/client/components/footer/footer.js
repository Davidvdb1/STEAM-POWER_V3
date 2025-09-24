//#region IMPORTS
import {define} from "../../abstracts/functionalBase.js";
import {componentBase} from "../../abstracts/componentBase.js";
import {getStyle, getTemplate} from "../../coreUtils/style.js";
//#endregion IMPORTS

//#region TEMPLATE
let template = await getTemplate("/components/footer/footer.html")
//#endregion TEMPLATE

//#region CLASS
define('footer-ɦ', class extends componentBase {

    async created() {
        this.shadow.appendChild(await getStyle('/components/footer/footer.css'));
    }
}, template);
//#endregion CLASS