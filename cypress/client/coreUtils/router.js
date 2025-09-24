"use strict"
//#region IMPORTS
// import { Base } from "./base.js";
//#endregion IMPORTS

//#region CLASS
import {keycloak} from "../libs/auth.js";
import {keycloakReady} from "../libs/auth.js";


window.customElements.define('router-χ', class extends HTMLElement {
    // constructor() {
    //     super();
    //     this._shadowRoot = this.attachShadow({ 'mode': 'open' });
    //     this._shadowRoot.appendChild(template.content.cloneNode(true));
    //     this.$example = this._shadowRoot.querySelector(".example");
    // }
    // component attributes
    static get observedAttributes() {
        return [];
    }
    attributeChangedCallback(name, oldValue, newValue) {
    }
    
    
    /**
     * Router looks for a wc-outlet tag for updating the views on history updates.
     * Example:
    *
    * <router>
    *  <outlet>
    *    <!-- All DOM update will be happening here on route change -->
    *  </outlet>
    * </router>
    */
   get outlet() {
       return this.querySelector("outlet-χ");
    }
    
    get root() {
        return window.location.pathname;
    }
    
    /**
     * Get all routes from the direct wc-route child element.
     * The document title can be updated by providing an
     * title attribute to the wc-route tag
    */
    get routes() {
        return Array.from(this.querySelectorAll("route-χ"))
        .filter(node => node.parentNode === this)
        .map(r => ({
                path: r.getAttribute("path"),
                // Optional: document title
                title: r.getAttribute("title"),
                // name of the web component the should be displayed
                component: r.getAttribute("component"),
                // Bundle path if lazy loading the component
                resourceUrl: r.getAttribute("resourceUrl"),
                // Optional: access roles array
                accessRoles: r.hasAttribute("accessRoles") ? r.getAttribute("accessRoles") : null
            }));
    }
    
    connectedCallback() {
        this.bindRoutes(this);
          // Ensure KC finished init before first navigation
              (async () => {
                    try { await keycloakReady; } catch {}
                    await this.navigate(window.location.pathname + window.location.search + window.location.hash);
              })();
        
        window.addEventListener("popstate", this._handlePopstate);
    }
    
    disconnectedCallback() {
        window.removeEventListener("popstate", this._handlePopstate);
    }

    loaded() {
        return true;
    }
    
    _handlePopstate = async () => {
        await this.navigate(window.location.pathname + window.location.search + window.location.hash);
    };
    
    bindRoutes(elem) {
        /**
         * Find all child link elements with route attribute to update the
         * href with route attribute value.
        *
        * Add custom click event handler to prevent the default
        * behaviour and navigate to the registered route onclick.
        */
        elem.querySelectorAll("a[route]").forEach(link => {
            const target = link.getAttribute("route");
            if (target === 'undefined') return;
            link.setAttribute("href", target);
            link.onclick = async e => {
                e.preventDefault();
                await this.navigate(target);
            };
        });
        
        elem.shadowRoot?.querySelectorAll("a[route]").forEach(link => {
            const target = link.getAttribute("route");
            if (target === 'undefined') return;
            link.setAttribute("href", target);
            link.onclick = async e => {
                e.preventDefault();
                await this.navigate(target);
            };
        });
    }
    
    async navigate(url) {
        const matchedRoute = match(this.routes, url);
        if (matchedRoute !== null) {
            // console.log("access roles: ", matchedRoute.accessRoles);
            if (matchedRoute.accessRoles) {
                // Make sure init is done and we have a fresh token
                      try { await keycloakReady; } catch {}
                      if (!keycloak?.authenticated) {
                            await keycloak.login({ redirectUri: window.location.origin + url });
                            return; // navigation will happen after redirect roundtrip
                      }

                if (keycloak) {
                    const required = matchedRoute.accessRoles.split(",").map(r => r.trim()).filter(Boolean);

                    // If this route expects WebUI client roles:
                    // const hasAccess = required.some(role => keycloak.hasResourceRole(role, "WebUI"));
                    const hasAccess = required.some(role => keycloak.hasRealmRole(role));

                    if (!hasAccess) {
                        console.warn("Access denied. Missing one of:", required);
                        await this.navigate("/denied");
                        return;
                    }
                } else {
                    console.warn("Access denied. Not authenticated.");
                    await this.navigate("/denied");
                    return;
                }
            }

            // console.log("Has Admin:");
            this.activeRoute = matchedRoute;
            window.history.pushState(null, null, url);
            this.update();
        }
    }
    
    /**
     * Update the DOM under outlet based on the active
     * selected route.
    */
   update() {
       const {
           component,
           title,
           params = {},
           resourceUrl = null
        } = this.activeRoute;
        console.log(this.activeRoute);
        
        if (component) {
            // Remove all child nodes under outlet element
            while (this.outlet.firstChild) {
                const child = this.outlet.firstChild;
                console.log(child);
                // if (child instanceof Base) {
                //     child.beforeDisconnectedCallback().then()
                // }
                this.outlet.removeChild(child);
            }

            const updateView = () => {
                const view = document.createElement(component);
                document.title = title || document.title;
                for (let key in params) {
                    /**
                     * all dynamic param value will be passed
                     * as the attribute to the newly created element
                     * except * value.
                    */
                   if (key !== "*") view.setAttribute(key, params[key]);
                }
                
                this.outlet.appendChild(view);
                // Update the route links once the DOM is updated
                this.bindRoutes(this);
                
                const ev = new CustomEvent('observer-notify', {
                    detail: { key: 'route-changed', value: this.activeRoute },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(ev);
            };
            
            if (resourceUrl !== null) {
                import(resourceUrl).then(updateView);
            } else {
                let resourceUrl = "/pages/" + component + ".js";
                import(resourceUrl).then(updateView);
            }
        }
    }

    async go(url) {
        await this.navigate(url);
    }
    
    back() {
        window.history.go(-1);
    }
});


let paramRe = /^:(.+)/;

function segmentize(uri) {
    return uri.replace(/(^\/+|\/+$)/g, "").split("/");
}

/**
 * The url matching function. Pass the route definitions and url to the match
 * and the method will return the matched definition or null if there is no
 * fallback scenario found is the definitions.
 *
 * Code is extracted from Reach router path match implementation
 * https://github.com/reach/router/blob/master/src/lib/utils.js
 *
 * @param {Array} routes - Route defenitions
 * @param {string} uri - Url to match
 */
export function match(routes, fullUri) {
    let match;
    const [uri] = fullUri.split("#");
    const [uriPathname] = uri.split("?");
    const uriSegments = segmentize(uriPathname);
    const isRootUri = uriSegments[0] === "/";
    for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        const routeSegments = segmentize(route.path);
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;
        let missed = false;
        let params = {};
        for (; index < max; index++) {
            const uriSegment = uriSegments[index];
            const routeSegment = routeSegments[index];
            const fallback = routeSegment === "*";

            if (fallback) {
                params["*"] = uriSegments
                    .slice(index)
                    .map(decodeURIComponent)
                    .join("/");
                break;
            }

            if (uriSegment === undefined) {
                missed = true;
                break;
            }

            let dynamicMatch = paramRe.exec(routeSegment);

            if (dynamicMatch && !isRootUri) {
                let value = decodeURIComponent(uriSegment);
                params[dynamicMatch[1]] = value;
            } else if (routeSegment !== uriSegment) {
                missed = true;
                break;
            }
        }

        if (!missed) {
            match = {
                params,
                ...route
            };
            break;
        }
    }

    return match || null;
}