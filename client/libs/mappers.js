/**
 * Remove CouchDB/DB meta fields from objects/arrays.
 * @param {Object|Object[]} data
 * @returns {Object|Object[]}
 */
export function stripCouchMeta(obj) {
    if (!obj || typeof obj !== "object") return obj;
    const { _id, _rev, _deleted, id, rev, ...rest } = obj;
    return rest;
}
export function cleanData(data) {
    if (Array.isArray(data)) return data.map(stripCouchMeta);
    return stripCouchMeta(data);
}

/**
 * Dynamically map a settings array to a Settings object.
 *
 * For any entry like { "setting-type": "foo", "foo": {...} },
 * output will have a Foo property: { Foo: {...} }
 *
 * @param {Array} arr - The settings array from the backend.
 * @returns {Object} Mapped settings object with dynamic keys.
 */
export function dynamicSettingsMapper(arr) {
    const out = {};

    arr.forEach(entry => {
        const type = entry["setting-type"];
        if (!type) return; // Skip if no type

        const key = type

        // Find the *first* property that's not "setting-type"
        // (So, supports { "setting-type": "qr", "QR": {...} })
        const valueKey = Object.keys(entry).find(
            k => k !== "setting-type"
        );
        if (!valueKey) return; // Skip if no value

        out[key] = entry[valueKey];
    });

    return out;
}