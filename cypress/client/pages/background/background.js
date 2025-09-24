import {define} from "../../abstracts/functionalBase.js";
import {componentBase} from "../../abstracts/componentBase.js";
import {getStyle, getTemplate} from "../../coreUtils/style.js";
import "../../components/pageWrapper/pageWrapper.js"


let template = await getTemplate("/pages/background/background.html");


define('background-ɮ', class extends componentBase {

    async created() {
        this.shadow.appendChild(await getStyle('/style/global.css'));
    }

}, template);