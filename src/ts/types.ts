// ---- Gallery -------------------------------------------------------------------

export interface GalleryImage {
    id: string;
    thumbnailUrl: string;
}

export interface CarouselOptions {
    mode: 'gallery' | 'structure';
    imageIds?: string[];
}

export interface GalleryElements {
    loading: HTMLElement;
    error: HTMLElement;
    container: HTMLElement;
    track: HTMLElement;
    indicators: HTMLElement;
    lightbox: HTMLElement;
    lightboxImage: HTMLImageElement;
}

// ---- Menu / navigation ---------------------------------------------------------

export interface MenuElements {
    toggle: HTMLElement | null;
    close: HTMLElement | null;
    menu: HTMLElement | null;
    overlay: HTMLElement | null;
}

// ---- Kegiatan ------------------------------------------------------------------

export interface KegiatanActivity {
    year: string;
    title: string;
    link: string;
    imageUrl?: string;
}

// ---- Tabs ----------------------------------------------------------------------

export interface TabOptions {
    /** CSS selector for tab button elements. */
    tabSelector: string;
    /** Attribute name on panel elements (e.g. `"data-org-panel"`). Pass null if no panels. */
    panelAttr: string | null;
    /** URL query-param key used to persist the active tab. */
    paramKey: string;
    /** Tab value to activate when no URL param is present. */
    defaultTab: string;
    /** Called every time the active tab changes. */
    onChange?: (value: string) => void;
}

export interface TabController {
    switchTab: (value: string) => void;
    /** Removes all event listeners attached by `initTabs`. */
    destroy: () => void;
}