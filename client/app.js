//#region IMPORTS
import '/components/header/header.js';
import '/components/footer/footer.js';
import '/coreUtils/router.js';
import { ʤ } from './coreUtils/observer.js';
import {componentBase} from "./abstracts/componentBase.js";
import {define} from "./abstracts/functionalBase.js";
import {initKeycloak, keycloakReady} from "./libs/auth.js";
//#endregion IMPORTS

initKeycloak();

//#region TEMPLATE
let template = /* html */ `
<style>

</style>

<router-χ>
    <route-χ path="/" title="Alert" component="alert-ɮ" resourceUrl="/pages/alert/alert.js"></route-χ>
    <route-χ path="/denied" title="Access Denied" component="denied-ɦ" resourceUrl="/pages/denied/denied.js"></route-χ>
    <route-χ path="/achtergrond" title="Achtergrond" component="background-ɮ" resourceUrl="/pages/background/background.js"></route-χ>
    <route-χ path="/begeleidingsgroep" title="Begeleidingsgroep" component="partners-ɮ" resourceUrl="/pages/partners/partners.js"></route-χ>
    <route-χ path="/projectteam" title="Projectteam" component="team-ɮ" resourceUrl="/pages/team/team.js"></route-χ>
    <route-χ path="/subsidiering" title="Subsidiëring" component="funding-ɮ" resourceUrl="/pages/funding/funding.js"></route-χ>
    <route-χ path="/bg-info" title="BG-Info" component="bg-info-ɮ" resourceUrl="/pages/bgInfo/bgInfo.js"></route-χ>
    <route-χ accessRoles="player" path="/player" title="Player" component="player-χ" resourceUrl="/pages/player/player.js"></route-χ>

    <outlet-χ></outlet-χ>
</router-χ>

`;
//#endregion TEMPLATE

//#region CLASS
define('app-ɦ', class extends componentBase {
    async created() {
        await keycloakReady;

        // ROUTING
        let $router = this.find(`router-χ`)
        // DISPATCH
        this.ʤ = new ʤ(["i18n"]);
        this.ʤ.addObserver("i18n", (_) => { window.localStorage.language = _ });
        this.ʤ.addDependency("router-χ", $router)
        $router.bindRoutes(this);
        // The event listener passes messages on to the eponymous dispatcher
        this.addEventListener('ʤ', (e) => {
            if (e.detail.channel === "dependency-provider") {
                this.ʤ.getDependency(e).then();
                return;
            }

            if (typeof e.detail.data != "function") {
                this.ʤ.notify(e.detail.channel, e.detail.data);
            } else {
                console.log("func");
                this.ʤ.addObserver(e.detail.channel, e.detail.data);
            }
        });

    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

}, template);
//#endregion CLASS