// ---- DOM helpers ---------------------------------------------------------------
/** Returns an element by ID, throwing if it doesn't exist. */
export function getById(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Element #${id} not found`);
    return el;
}
/** Returns an element by ID, or null if it doesn't exist. */
export function findById(id) {
    return document.getElementById(id);
}
// ---- Math helpers --------------------------------------------------------------
/** Clamps a number between min and max (inclusive). */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}
// ---- URL helpers ---------------------------------------------------------------
/** Updates a query param in the URL without triggering a page reload. */
export function setUrlParam(key, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
}
/** Reads a query param from the current URL, or null if absent. */
export function getUrlParam(key) {
    return new URLSearchParams(window.location.search).get(key);
}
//# sourceMappingURL=dom.js.map