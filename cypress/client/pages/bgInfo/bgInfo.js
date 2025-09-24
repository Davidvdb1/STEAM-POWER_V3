import '../../components/secretInfo/secretInfo.js';
import {define} from "../../abstracts/functionalBase.js";
import {componentBase} from "../../abstracts/componentBase.js";
import {getStyle, getTemplate} from "../../coreUtils/style.js";
import "../../components/pageWrapper/pageWrapper.js"
import {keycloak} from "../../libs/auth.js";


let template = await getTemplate("/pages/bgInfo/bgInfo.html");


define('bg-info-ɮ', class extends componentBase {

    async created() {
        this.shadow.appendChild(await getStyle('/style/global.css'));


        if (keycloak?.hasRealmRole("steeringGroup")) {
            this.find('#secureSection').remove()
            this.find('#bg-info').appendChild(document.createElement("secret-info-ɮ"))
        }
        let self = this

        this.find('#login').addEventListener("click", () => {
            self.showSecretInfo()
        })
    }

    async showSecretInfo() {
        if (!keycloak?.authenticated) {
            await keycloak.login();
            return; // navigation will happen after redirect roundtrip
        }
        if (!keycloak.hasRealmRole("steeringGroup")) {
            this.find('#error').textContent = "You dont have access to this information."
            return
        }
        this.find('#secureSection').remove()
        this.find('#bg-info').appendChild(document.createElement("secret-info-ɮ"))

    }
}, template);