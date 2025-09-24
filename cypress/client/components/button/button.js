import {componentBase} from "../../abstracts/componentBase.js";
import {define} from "../../abstracts/functionalBase.js";
import {getStyle, getTemplate} from "../../coreUtils/style.js";

const template = await getTemplate("/components/button/button.html");

define('button-χ', class extends componentBase {
    async created() {
        this.shadow.appendChild(await getStyle('/components/button/button.css'));
    }
}, template);