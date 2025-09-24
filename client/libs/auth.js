import Keycloak from "./keycloak.js";

export let keycloak;
export let keycloakReady;
let _refreshing = null;


export function initKeycloak() {
        // Initialize Keycloak
        keycloak = new Keycloak({
            url: 'https://keycloak-dev.re-frame.io',
            realm: 'xplab_alert-project',
            clientId: 'WebUI'
        });

      keycloakReady = keycloak.init({
            onLoad: 'check-sso',
            pkceMethod: 'S256',
            checkLoginIframe: true,
            silentCheckSsoRedirectUri: location.origin + '/silent-check-sso.html',
            silentCheckSsoFallback: true
          }).then(() => {
            console.log('[KC] init done. authenticated=', keycloak.authenticated);

            // Auto-refresh when KC says the token expired
            keycloak.onTokenExpired = async () => {
            const ok = await safeUpdateToken(30);
            if (!ok) {
                  console.warn('[KC] token refresh failed on expiry; staying logged-out for guards');
                }
            };

          }).catch((e) => {
            console.error('[KC] init failed', e);
          });

          return keycloakReady;
}



// Single-flight refresh that never runs if not authenticated
    export async function safeUpdateToken(minValidity = 30) {
      if (!keycloak?.authenticated) return false;
      if (_refreshing) return _refreshing;
      _refreshing = keycloak.updateToken(minValidity)
            .then(() => true)
        .catch((err) => {
              console.warn('[KC] updateToken failed', err);
              try { keycloak.clearToken(); } catch {}
              return false;
            })
        .finally(() => { _refreshing = null; });
      return _refreshing;
    }

function getToken() {
    if (!keycloak.authenticated){
        keycloak.login()
    }

    return keycloak.token;
}