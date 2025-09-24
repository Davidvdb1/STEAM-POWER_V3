//#region IMPORTS
import '../header/header.js';
import '../footer/footer.js';

import {componentBase} from "../../abstracts/componentBase.js";
import {define} from "../../abstracts/functionalBase.js";
import {getStyle, getTemplate} from "../../coreUtils/style.js";
//#endregion IMPORTS


//#region TEMPLATE
let template = await getTemplate("/components/pageWrapper/pageWrapper.html")
//#endregion TEMPLATE


//#region CLASS
define('page-wrapper-χ', class extends componentBase {
    async created() {
        this.shadow.appendChild(await getStyle('/components/pageWrapper/pageWrapper.css'));

    }
}, template);
//#endregion CLASS