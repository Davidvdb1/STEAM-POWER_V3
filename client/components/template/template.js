import {componentBase} from "../../abstracts/componentBase.js";
import {define} from "../../abstracts/functionalBase.js";
import {getStyle, getTemplate} from "../../coreUtils/style.js";

const template = await getTemplate("/components/template/template.html");

define('template-χ', class extends componentBase {
    async created() {
        this.shadow.appendChild(await getStyle('/components/template/template.css'));
    }
}, template);