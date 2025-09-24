//#region IMPORTS
import {componentBase} from "../../abstracts/componentBase.js";
import {define} from "../../abstracts/functionalBase.js";
import {getStyle, getTemplate} from "../../coreUtils/style.js";

import "../../components/button/button.js"
//#endregion IMPORTS


//#region TEMPLATE
let template = await getTemplate("/components/welcome/welcome.html")
//#endregion TEMPLATE


//#region CLASS
define('welcome-χ', class extends componentBase {
    async created() {
        this.shadow.appendChild(await getStyle('/components/welcome/welcome.css'));

        await this.inject(`router-χ`);
        this.µRouter.bindRoutes(this);

    }

    setMode(mode){
        this.setAttribute("mode", mode);
    }
}, template);
//#endregion CLASS