/**
 * Reactive multi-channel observer and async dependency injection manager.
 *
 * The `ʤ` class is a general-purpose event-driven system for:
 *  - Observing and broadcasting updates on named channels (for cross-component communication, e.g. "i18n", "theme", "user", etc.)
 *  - Providing async dependency injection for custom elements using events and Promises.
 *
 * ### Channel Observation
 * Channels can be observed and notified for any shared app state, using `addObserver` and `notify`.
 *
 * ### Dependency Injection
 * When a dependency is injected (using e.g. `await this.inject("router-χ")` in a component), a custom event is dispatched with channel `"dependency-provider"`.
 * The ʤ observer listens for these events and provides the dependency by resolving the event’s Promise,
 * typically by dynamic import and creation of the element.
 *
 */
export class ʤ {

    /**
     * Initializes the observer system and dependency map.
     * @param {string[]} observationList - List of observer channel names to track.
     */
    constructor(observationList) {
        // Add dependency provider to observation list
        observationList.push("dependency-provider");

        /**
         * Observer registry: channel name -> array of callbacks.
         * @type {Object.<string, Function[]>}
         */
        this.observers = {};
        observationList.forEach((channel) => {
            this.observers[channel] = []
        });

        /**
         * Map of registered dependency instances by key.
         * @type {Map<string, *>}
         */
        this.dependencies = new Map();

        // Register built-in dependency provider observer
        this.addObserver("dependency-provider", this.getDependency);
    }

    /**
     * Registers a callback function to observe notifications on a given channel.
     * @param {string} channel - Channel name to observe.
     * @param {Function} callback - Callback function to invoke when notified.
     */
    addObserver(channel, callback) {
        this.observers[channel].push(callback);
    }

    /**
     * Removes a previously registered callback from a channel.
     * @param {string} channel - Channel name.
     * @param {Function} callback - Callback function to remove.
     */
    removeObserver(channel, callback) {
        let index = this.observers[channel].indexOf(callback);
        if (index >= 0) {
            this.observers[channel].splice(index, 1);
        }
    }

    /**
     * Notifies all registered observers on a given channel.
     * @param {string} channel - Channel name to notify.
     * @param {*} notification - Data payload for the notification.
     *
     * @example
     * observer.notify('i18n', 'fr');
     */
    notify(channel, notification) {
        console.log(`notifying ::: ${channel} <<< ${notification}`);
        this.observers[channel].forEach((callback) => callback(notification));
    }

    /**
     * Handles `'dependency-provider'` custom events by resolving and providing the requested dependency.
     *
     * This method is intended to be used as an async event handler. When a dependency request event is received,
     * it checks if the dependency is already registered. If so, it immediately resolves the request with the cached dependency.
     * If not, it dynamically imports the module (based on the key or file name), creates the custom element,
     * registers it, and resolves the event with the new instance.
     *
     * The resolved dependency is passed via the `resolve` callback provided in the event's detail.
     *
     * @async
     * @param {CustomEvent} e - The event containing dependency request details:
     *   @param {Object} e.detail.data
     *   @param {string} e.detail.data.key - The dependency key (used for both registration and element creation).
     *   @param {string|null} e.detail.data.fileName - Optional override for the file name to import.
     *   @param {Function} [e.detail.resolve] - Resolver function (from a Promise) to call with the dependency instance.
     *
     * @example
     * // Register as an event handler:
     * someElement.addEventListener('ʤ', async e => await this.getDependency(e));
     *
     * // When handling an injection:
     * await this.inject('my-dep-χ');
     * // Now this.µMyDep is available.
     *
     * @note
     * - The dependency element is created and prepended to document.body if not already registered.
     * - The Promise passed via the event is resolved with the instance of the dependency.
     * - This method is **asynchronous** and should always be awaited.
     */
    async getDependency(e) {
        const key = e.detail.data.key;
        const fileName = e.detail.data.fileName;

        // Helper to resolve and stop propagation
        const finish = (dep) => {
            if (typeof e.detail.resolve === "function") {
                e.detail.resolve(dep);
                e.stopPropagation();
            }
        };

        if (this.dependencies.has(key)) {
            // Use already registered dependency
            finish(this.dependencies.get(key));
        } else {
            // Dynamically import module for dependency
            let importString;
            if (fileName === null)
                importString = "/dependencies/" + key + ".js";
            else
                importString = "/dependencies/" + fileName + ".js";

            await import(importString);
            const dependency = document.createElement(key);
            document.body.prepend(dependency);
            this.addDependency(key, dependency);
            finish(dependency);
        }
    }

    /**
     * Registers a dependency instance under the given key.
     * @param {string} key - The dependency key.
     * @param {*} dependency - The dependency instance (usually a custom element).
     *
     * @example
     * observer.addDependency('router-χ', myRouterInstance);
     */
    addDependency(key, dependency) {
        this.dependencies.set(key, dependency);
    }
}