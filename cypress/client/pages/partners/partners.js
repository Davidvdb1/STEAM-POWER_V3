import {componentBase} from "../../abstracts/componentBase.js";
import {define} from "../../abstracts/functionalBase.js";
import {getStyle, getTemplate} from "../../coreUtils/style.js";
import "../../components/pageWrapper/pageWrapper.js"


let template = await getTemplate("/pages/partners/partners.html");


define('partners-ɮ', class extends componentBase {
    async created() {

        this.shadow.appendChild(await getStyle('/style/global.css'));
        this.shadow.appendChild(await getStyle('/pages/partners/partners.css'));
    }

}, template);