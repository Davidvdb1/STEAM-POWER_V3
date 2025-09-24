/**
 * Base class for all custom elements, supporting async dependency injection and i18n.
 */
export class functionalBase extends HTMLElement {

    /**
     * Lifecycle: Called when the element is instantiated.
     * Runs pre-hooks from base class.
     * @returns {void}
     */
    constructor() {
        super();
        this.funcInit(); // Pre-hook logic from base
    }

    /**
     * Lifecycle: Called when the element is connected to the DOM.
     * Runs pre-hooks, i18n init, and post-hooks.
     */
    async connectedCallback() {
        if (this.hasAttribute("i18n")) this.initI18n();
        await this.created();
    }


    /**
     * Lifecycle: Called when the element is about to be removed from the DOM.
     * Override to implement cleanup logic.
     *
     * @returns {Promise<void>}
     */
    async destroyed() {
        // Override for cleanup logic
    }

    /**
     * Lifecycle: Called when the element is disconnected from the DOM.
     * Calls destroyed() for cleanup.
     * @returns {Promise<void>}
     */
    async disconnectedCallback() {
        await this.destroyed();
    }

    /**
     * Initializes i18n if the "i18n" attribute is present.
     * Dispatches a custom event for translation requests.
     */
    initI18n(){
        let i18n = this.getAttribute("i18n");
        if (i18n) {
            console.log("functionalBase i18n LAUNCHED", i18n);
            queueMicrotask(() => {
                this.dispatchEvent(new CustomEvent('ʤ', {
                    bubbles: true,
                    cancelable: false,
                    composed: true,
                    detail: {
                        channel: "i18n",
                        data: (_) => {
                            console.log("NOTIFIED BALLON! ", _);
                            this.i18n(_);
                        }
                    }
                }));
            });
        }
    }

    /**
     * Called to update all `.i18n` elements with the selected language.
     * @param {string} language
     */
    i18n(language) {
        console.log("i18n SOURCING");
        this.findAll(".i18n").forEach((_) => {
            console.log("source" + this.id, language, _.id);
        });
    }

    /**
     * Utility: Dispatch a notification to observers.
     * @param {string} channel - The notification channel name.
     * @param {*} notification - Notification data payload.
     */
    notify(channel, notification) {
        this.dispatchEvent(new CustomEvent('ʤ', {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: {
                channel: channel,
                data: notification
            }
        }));
    }

    /**
     * Injects and retrieves a dependency by name, initializing it if necessary.
     *
     * @async
     * @param {string} dependency - The dependency identifier.
     *   - Expected in dash-separated format (e.g., "user-service-χ", "test-dep-ɮ").
     *   - The final segment (starting with the last dash and any following non-alphanumeric characters) is stripped.
     *   - The remaining string is converted to CapitalCase (e.g., "test-dep-ɮ" becomes "TestDep").
     *   - This transformed string is used as the dependency key.
     * @param {string|null} [fileName=null] - Optional override for the file name to import for the dependency.
     *
     * @note The dependency is stored as `this["µ" + Key]`, where `Key` is the CapitalCased dependency functionalBase.
     *       After calling `await this.inject(dependency)`, you can access the dependency as `this.µ<Key>`.
     *
     * @note **Important:** `inject` is asynchronous and must be awaited. Use it inside an `async` method, or after `awaitDependencies()`.
     *
     * @example
     * await this.inject('database-connection-χ');
     * const db = this.µDatabaseConnection; // db is ready to use
     *
     * @example
     * await this.inject('user-service-ɮ', 'custom-user-file');
     * const userService = this.µUserService; // userService is ready to use
     */
    async inject(dependency, fileName = null) {
        const base = dependency.replace(/-([^\w]+)$/i, '');
        // Convert dashed part to CapitalCase
        let dep = base.replace(/(?:^|-)([a-zA-Z0-9])/g, (_, chr) => chr.toUpperCase());
        const key = "µ" + dep;
        if (this[key]) return;
        this[key] = await this._dependencyProvider(dependency, fileName);
    }

    /**
     * Dispatches a CustomEvent to request a dependency provider for the given key and file name.
     * Returns a Promise that resolves with the dependency instance.
     *
     * @async
     * @param {string} key - The dependency identifier, typically as passed to inject().
     * @param {string|null} [fileName=null] - Optional override for the dependency file name.
     * @returns {Promise<*>} The resolved dependency instance provided by the event handler.
     *
     * @example
     * const dep = await this._dependencyProvider('router-χ', null);
     */
    async _dependencyProvider(key, fileName) {
        return new Promise((resolve, reject) => {
            let e = new CustomEvent('ʤ', {
                detail: {
                    channel: 'dependency-provider',
                    data: {
                        key: key,
                        fileName: fileName
                    },
                    resolve, // The Promise resolver for the dependency
                    reject   // The Promise rejector for errors (optional)
                },
                bubbles: true,
                composed: true,
                cancelable: true
            });
            this.dispatchEvent(e);
        });
    }

    /**
     * Override: Optional logic before functionalBase connectedCallback.
     */
    funcInit() { }

    /**
     * Override: Optional async logic after functionalBase connectedCallback and init.
     */
    async created() { }
}

/**
 * Helper to define a custom element with a template.
 * @param {string} name - The element's tag name.
 * @param {CustomElementConstructor} classContent - The class constructor for the element.
 * @param {string} template - HTML template for the element.
 */
export function define(name, classContent, template) {
    let temp = document.createElement('template');
    temp.innerHTML = template;
    classContent.prototype.temp = temp;
    window.customElements.define(name, classContent);
}