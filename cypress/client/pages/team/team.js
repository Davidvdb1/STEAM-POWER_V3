import {componentBase} from "../../abstracts/componentBase.js";
import {define} from "../../abstracts/functionalBase.js";
import {getStyle, getTemplate} from "../../coreUtils/style.js";
import "../../components/pageWrapper/pageWrapper.js"

let template = await getTemplate("/pages/team/team.html");

define('team-ɮ', class extends componentBase {
    async created() {
        this.shadow.appendChild(await getStyle('/style/global.css'));
    }
}, template);