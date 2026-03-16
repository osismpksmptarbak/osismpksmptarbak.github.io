/** Get element by ID, throws if not found */
export function getById<T extends HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Element #${id} not found`);
    return el as T;
}
 
/** Get element by ID, returns null if not found */
export function findById<T extends HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
}
 
/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
}
 
/** Push a query param to the URL without reloading */
export function setUrlParam(key: string, value: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
}
 
/** Get a query param from the current URL */
export function getUrlParam(key: string): string | null {
    return new URLSearchParams(window.location.search).get(key);
}
 