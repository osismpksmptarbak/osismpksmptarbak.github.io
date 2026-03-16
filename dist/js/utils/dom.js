/** Get element by ID, throws if not found */
export function getById(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Element #${id} not found`);
    return el;
}
/** Get element by ID, returns null if not found */
export function findById(id) {
    return document.getElementById(id);
}
/** Clamp a number between min and max */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}
/** Push a query param to the URL without reloading */
export function setUrlParam(key, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
}
/** Get a query param from the current URL */
export function getUrlParam(key) {
    return new URLSearchParams(window.location.search).get(key);
}
//# sourceMappingURL=dom.js.map