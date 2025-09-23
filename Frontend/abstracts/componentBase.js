import { functionalBase } from "./functionalBase.js";
import {getStyle} from "../coreUtils/style.js";

/**
 * `componentBase` extends {@link functionalBase}, adding:
 * - Shadow DOM setup (template cloning + optional i18n)
 * - **Data bindings** via `bind="name"`:
 *    - Two-way sync: DOM <-> `this.name`
 *    - Element handles: `this.$name` (first element), `this.$$.name` (all elements)
 * - **Declarative event bindings** via `event="type | handler | params"`
 * - Parent → child API injection with {@link exposeApiToChildren}
 *
 * @example
 * // Template (inside your component file)
 * <template id="user-card">
 *   <input bind="username" placeholder="Type name"/>
 *   <div bind="username"></div>
 *   <button event="click | saveUser | username">Save</button>
 * </template>
 *
 * // Component
 * class UserCard extends componentBase {
 *   created() {
 *     this.username = '';                // initializes DOM via binding
 *     this.find('input').focus();
 *   }
 *
 *   saveUser(name) {
 *     console.log('Saving:', name);      // receives current `this.username`
 *   }
 *
 *   async bindingChanged(name, oldVal, newVal) {
 *     if (name === 'username') {
 *       const warn = this.find('#warn');
 *       if (warn) warn.textContent = (newVal || '').length < 3 ? 'Too short' : '';
 *     }
 *   }
 * }
 */
export class componentBase extends functionalBase {
    /**
     * Reference to the element's shadow root.
     * @type {ShadowRoot}
     * @private
     */
    _shadow;

    /**
     * @template T
     * @typedef {Object} ParentApi
     * @description Abstract type for APIs injected from parent to child. See {@link exposeApiToChildren}.
     */
    parentApi;

    /**
     * Read-only getter to the created shadow root.
     * @returns {ShadowRoot}
     */
    get shadow() {
        return this._shadow;
    }

    /**
     * Lifecycle: Called when the element is instantiated.
     * Attaches shadow DOM, clones the template, then runs pre-hooks from {@link functionalBase}.
     * @override
     */
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'open' });
        // Optionally: this._shadow.appendChild(await getStyle('/css/shared.css'));
        this._shadow.appendChild(this.temp.content.cloneNode(true));
        this.compInit(); // Pre-hook logic from functionalBase
    }

    /**
     * Lifecycle: Called when the element is connected to the DOM.
     * Initializes, attaches shadow DOM, clones the template, wires data & event bindings,
     * optionally initializes i18n, then runs {@link created}.
     *
     * @override
     * @async
     */
    async connectedCallback() {
        // this._shadow.appendChild(await getStyle('/style/global.css'));
        this._setupBindings();       // data bindings (two-way + `$` handles)
        this._setupEventBindings();  // declarative event bindings

        if (this.hasAttribute("i18n")) this.initI18n();
        await this.created(); // Post-hook logic from functionalBase
    }

    /**
     * Optional hook: override to run logic after shadow DOM is set up but before `connectedCallback`.
     * @returns {void}
     */
    compInit() { }


    /**
     * Finds the first matching element inside the shadow DOM.
     * @param {string} selector - CSS selector.
     * @returns {Element|null}
     *
     * @example
     * const btn = this.find('button.submit');
     */
    find(selector) {
        return this._shadow?.querySelector(selector);
    }

    /**
     * Finds all matching elements inside the shadow DOM.
     * @param {string} selector - CSS selector.
     * @returns {NodeListOf<Element>}
     *
     * @example
     * const items = this.findAll('.list-item');
     */
    findAll(selector) {
        return this._shadow?.querySelectorAll(selector);
    }

    // ---------------------------------------------------------------------------
    // DATA BINDINGS
    // ---------------------------------------------------------------------------

    /**
     * Scans the shadow DOM for `[bind]` attributes and sets up:
     * - Two-way value synchronization between DOM and component fields (`this[key]`).
     * - Element handles:
     *    - `this.$key` → first element bound to `key`
     *    - `this.$$.key` → array of all elements bound to `key`
     *
     * For input-like elements (`input`, `select`, `textarea`), the binding tracks `.value`
     * (or `.checked` for checkbox/radio). For non-input elements, it writes to `textContent`
     * by default (special cases respected: see {@link _renderBindingToElement}).
     *
     * @private
     */
    _setupBindings() {
        const self = this;

        /** @type {Map<string, Element[]>} */
        this._bindEls = new Map();

        // 1) collect and index all [bind] elements
        const all = this.shadowRoot.querySelectorAll('[bind]');
        all.forEach(el => {
            const key = el.getAttribute('bind');
            if (!key) return;

            if (!this._bindEls.has(key)) this._bindEls.set(key, []);
            this._bindEls.get(key).push(el);

            // expose first element as this.$key (and keep enumerable=false to avoid JSON noise)
            if (!Object.prototype.hasOwnProperty.call(this, `$${key}`)) {
                Object.defineProperty(this, `$${key}`, {
                    value: el, configurable: true, enumerable: false, writable: true
                });
            }
        });

        // optional: an index of all bound elements
        this.$$ = Object.fromEntries(
            [...this._bindEls.entries()].map(([k, els]) => [k, els])
        );

        // 2) create a proxy so setting this.bindings.key updates DOM
        this.bindings = new Proxy(this, {
            set: (_, key, value) => {
                self._updatingBindings(String(key), value);
                return true;
            }
        });

        // 3) wire inputs → model (two-way)
        this._bindEls.forEach((els, key) => {
            els.forEach(el => {
                const tag = el.tagName.toUpperCase();
                const isInput =
                    tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

                if (isInput) {
                    // initialize from model if present, else from DOM
                    if (typeof self[key] !== 'undefined') {
                        self._setElementValue(el, self[key]);
                    } else {
                        // initialize model once from the first input’s current value
                        self._updatingBindings(key, self._getElementValue(el));
                    }

                    const push = () => {
                        self._updatingBindings(key, self._getElementValue(el));
                    };
                    el.addEventListener('input', push);
                    el.addEventListener('change', push);
                } else {
                    // initialize non-inputs from model if present
                    if (typeof self[key] !== 'undefined') {
                        self._renderBindingToElement(el, key, self[key]);
                    }
                }
            });
        });
    }

    /**
     * Extracts the **binding value** from a DOM element.
     * - `input[type=checkbox|radio]` → `boolean` from `.checked`
     * - Other `<input>`, `<select>`, `<textarea>` → `string` from `.value`
     * - Other elements → `string` from `.textContent`
     *
     * @param {HTMLElement} el
     * @returns {string|boolean}
     * @private
     */
    _getElementValue(el) {
        if (el.tagName === 'INPUT') {
            const type = (el.type || '').toLowerCase();
            if (type === 'checkbox' || type === 'radio') return !!el.checked;
            return el.value ?? '';
        }
        if (el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
            return el.value ?? '';
        }
        return el.textContent ?? '';
    }

    /**
     * Writes a **binding value** to a DOM element. Mirrors the rules in {@link _getElementValue}.
     *
     * @param {HTMLElement} el
     * @param {any} value
     * @private
     */
    _setElementValue(el, value) {
        if (el.tagName === 'INPUT') {
            const type = (el.type || '').toLowerCase();
            if (type === 'checkbox' || type === 'radio') {
                el.checked = !!value;
                return;
            }
            el.value = value ?? '';
            return;
        }
        if (el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
            el.value = value ?? '';
            return;
        }
        el.textContent = (value ?? '').toString();
    }

    /**
     * Applies a binding value to a non-input element, respecting special cases:
     * - Custom `IF-χ` element → sets `value` attribute
     * - `BUTTON`, `A`, `SPAN`, `G` → ignored by default (content not overwritten)
     * - Others → write via {@link _setElementValue} (textContent)
     *
     * @param {HTMLElement} el
     * @param {string} binding
     * @param {any} value
     * @private
     */
    _renderBindingToElement(el, binding, value) {
        if (el.nodeName === ('IF-χ')) { el.setAttribute('value', value); return; }

        const tag = el.tagName.toUpperCase();
        if (tag === 'BUTTON' || tag === 'A' || tag === 'SPAN' || tag === 'G') return; // don’t overwrite content
        this._setElementValue(el, value);
    }

    /**
     * Core update routine called whenever a binding changes (from DOM or programmatically).
     * - Updates `this[binding]`
     * - Re-renders **all** elements bound to `binding`
     * - Keeps `this.$binding` handle in sync (points to first element)
     * - Invokes {@link bindingChanged} with `(name, oldValue, newValue)`
     *
     * @param {string} binding
     * @param {any} value
     * @private
     */
    _updatingBindings(binding, value) {
        const old = this[binding];
        this[binding] = value;

        // update every element bound to this key
        const els = this._bindEls.get(binding) || [];
        els.forEach(el => this._renderBindingToElement(el, binding, value));

        // primary element handle exists as this.$binding (no extra work needed here)
        this.bindingChanged(binding, old, value)?.catch?.(() => {});
    }

    /**
     * Optional hook: override to react to binding changes (validation, derived state, side effects).
     * Called for **every** change, regardless of whether it originated from DOM or code.
     *
     * @param {string} name - Binding name (e.g., `"username"`)
     * @param {any} oldValue
     * @param {any} newValue
     * @returns {Promise<void>|void}
     *
     * @example
     * async bindingChanged(name, oldValue, newValue) {
     *   if (name === 'email') {
     *     const ok = /\S+@\S+\.\S+/.test(newValue || '');
     *     this.find('#emailError')?.replaceChildren(ok ? '' : 'Invalid email');
     *   }
     *   if (name === 'firstName' || name === 'lastName') {
     *     this.bindings.fullName = [this.firstName, this.lastName].filter(Boolean).join(' ');
     *   }
     * }
     */
    async bindingChanged(name, oldValue, newValue) {}

    // ---------------------------------------------------------------------------
    // EVENT BINDINGS
    // ---------------------------------------------------------------------------

    /**
     * Scans for `[event]` attributes and attaches declarative listeners.
     *
     * Syntax:
     *   `event="type | handler | params"`
     *   Multiple events on one element can be separated by `;`
     *   e.g. `event="mouseenter | hilite | true; mouseleave | hilite | false"`
     *
     * Parameter resolution rules (per token):
     *   - `"str"` or `'str'` → string literal
     *   - `true` / `false` → boolean
     *   - `42`, `3.14` → number
     *   - `username` (unquoted) → if `this.username` exists and is not a function, pass its current value; otherwise pass the literal string
     * The **native event** is appended as the **last argument**.
     *
     * @private
     *
     * @example
     * // in template
     * <button event="click | saveUser | username"></button>
     * // in class
     * saveUser(name, ev) { console.log(name, ev.target); }
     */
    _setupEventBindings() {
        const els = this.shadowRoot.querySelectorAll('[event]');
        els.forEach(el => {
            const raw = el.getAttribute('event')?.trim();
            if (!raw) return;

            const entries = raw.split(';').map(s => s.trim()).filter(Boolean);
            entries.forEach(entry => {
                const { type, handler, params } = this._parseEventDescriptor(entry);
                if (!type || !handler) return;
                if (typeof this[handler] !== 'function') {
                    console.warn(`Event binding: handler "${handler}" is not a function on`, this);
                    return;
                }
                // Avoid double-binding
                const key = `__evt_${type}_${handler}`;
                if (el[key]) return;

                const listener = (ev) => {
                    try {
                        const resolved = params.map(p => this._resolveEventParam(p));
                        this[handler](...resolved, ev);
                    } catch (e) {
                        console.error('Event handler error:', e);
                    }
                };

                el.addEventListener(type, listener);
                el[key] = listener;
            });
        });
    }

    /**
     * Parses an event descriptor like `"click | saveUser | username, 'OK', 2000"`.
     * @param {string} desc
     * @returns {{type: string|null, handler: string|null, params: string[]}}
     * @private
     */
    _parseEventDescriptor(desc) {
        const parts = desc.split('|').map(s => s.trim());
        const type = parts[0] || null;
        const handler = parts[1] || null;
        const params = (parts[2] || '')
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        return { type, handler, params };
    }

    /**
     * Resolves a single event parameter token to a runtime value.
     * See {@link _setupEventBindings} for resolution rules.
     *
     * @param {string} token
     * @returns {any}
     * @private
     */
    _resolveEventParam(token) {
        // Quoted string?
        const m = token.match(/^(['"])(.*)\1$/);
        if (m) return m[2];

        // Boolean?
        if (token === 'true') return true;
        if (token === 'false') return false;

        // Number?
        if (!Number.isNaN(Number(token)) && token.trim() !== '') return Number(token);

        // Binding variable?
        if (Object.prototype.hasOwnProperty.call(this, token) && typeof this[token] !== 'function') {
            return this[token];
        }

        // Fallback: literal string
        return token;
    }

    // ---------------------------------------------------------------------------
    // PARENT → CHILD API INJECTION
    // ---------------------------------------------------------------------------

    /**
     * Binds a parent API proxy to custom-element children and keeps it updated
     * if new children are added dynamically. Children receive `this.parentApi`.
     *
     * @param {Object} apiObject - The API object whose functions will be callable by children.
     * @param {string} [selector='*'] - Query selector to limit which descendants receive the API.
     *
     * @example
     * class MyParent extends componentBase {
     *   created() {
     *     const api = { greet: msg => console.log('Parent:', msg) };
     *     this.exposeApiToChildren(api, 'my-child'); // only <my-child> descendants
     *   }
     * }
     *
     * class MyChild extends componentBase {
     *   created() {
     *     this.find('button').addEventListener('click', () => {
     *       this.parentApi?.greet('Hello from child!');
     *     });
     *   }
     * }
     */
    exposeApiToChildren(apiObject, selector = '*') {
        if (!this._parentApiObserver) {
            this._parentApiObserver = new MutationObserver(() => {
                this._applyApiToChildren(apiObject, selector);
            });
        }
        // Observe children for dynamic updates
        this._parentApiObserver.observe(this, { childList: true, subtree: true });
        // Initial application
        this._applyApiToChildren(apiObject, selector);
    }

    /**
     * Internal utility: applies the API proxy to all matching child custom elements (tag names with a dash).
     * @param {Object} apiObject
     * @param {string} selector
     * @private
     */
    _applyApiToChildren(apiObject, selector) {
        const all = Array.from(this.findAll(selector)).filter(el => el.tagName.includes('-'));
        for (const el of all) {
            if (!el.parentApi) {
                el.parentApi = new Proxy(apiObject, {
                    get(target, prop, receiver) {
                        return Reflect.get(target, prop, receiver);
                    }
                });
            }
        }
    }
}