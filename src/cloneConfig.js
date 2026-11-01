/**
 * Deep-clone plain config data while preserving non-plain values by reference.
 * This keeps runtime metadata out of the source configuration snapshot.
 *
 * @param {*} value - Config value to clone.
 * @param {WeakMap<Object, Object>} [seen] - Previously cloned objects.
 * @returns {*} Cloned config value.
 */
function cloneConfig(value, seen = new WeakMap()) {
    if (value === null || typeof value !== "object") return value;
    if (seen.has(value)) return seen.get(value);

    if (Array.isArray(value)) {
        const clone = [];
        seen.set(value, clone);
        for (const item of value) clone.push(cloneConfig(item, seen));
        return clone;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return value;

    const clone = Object.create(prototype);
    seen.set(value, clone);
    for (const key of Reflect.ownKeys(value)) {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (Object.hasOwn(descriptor, "value")) {
            descriptor.value = cloneConfig(descriptor.value, seen);
        }
        Object.defineProperty(clone, key, descriptor);
    }
    return clone;
}

module.exports = cloneConfig;
