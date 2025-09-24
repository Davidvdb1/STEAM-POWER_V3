//#region IMPORTS
import {componentBase} from "../../abstracts/componentBase.js";
import {define} from "../../abstracts/functionalBase.js";
import "../../components/pageWrapper/pageWrapper.js"
import {getStyle, getTemplate} from "../../coreUtils/style.js";

//#region TEMPLATE
let template = await getTemplate("/pages/alert/alert.html")
//#endregion TEMPLATE

//#region CLASS
define('alert-ɮ', class extends componentBase {

    async created() {
        this.shadow.appendChild(await getStyle('/style/global.css'));
    }


}, template);
//#endregion CLASS