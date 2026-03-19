// ---- DOM helpers ---------------------------------------------------------------

/** Returns an element by ID. Throws if not found. */
export function getById<T extends HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Element #${id} not found`);
    return el as T;
}

/** Returns an element by ID, or null if not found. */
export function findById<T extends HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
}

// ---- Math helpers --------------------------------------------------------------

/** Clamps a number between min and max (inclusive). */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
}

// ---- URL helpers ---------------------------------------------------------------

/** Updates a query param in the URL without triggering a page reload. */
export function setUrlParam(key: string, value: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
}

/** Reads a query param from the current URL. Returns null if absent. */
export function getUrlParam(key: string): string | null {
    return new URLSearchParams(window.location.search).get(key);
}