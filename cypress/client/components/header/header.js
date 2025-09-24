//#region IMPORTS
import {define} from "../../abstracts/functionalBase.js";
import {componentBase} from "../../abstracts/componentBase.js";
import {getStyle, getTemplate} from "../../coreUtils/style.js";
//#endregion IMPORTS

//#region TEMPLATE
let template = await getTemplate("/components/header/header.html")
//#endregion TEMPLATE

//#region CLASS
define('header-ɦ', class extends componentBase {

    async created() {
        this.shadow.appendChild(await getStyle('/components/header/header.css'));
        await this.inject(`router-χ`);
        this.µRouter.bindRoutes(this);
    }

}, template);
//#endregion CLASS