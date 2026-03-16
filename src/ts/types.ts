export interface GalleryImage {
    id: string;
    thumbnailUrl: string;
}

export interface CarouselOptions {
    mode: 'gallery' | 'structure';
    imageIds?: string[];
    altPrefix?: string;
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

export interface KegiatanActivity {
    year: string;
    title: string;
    link: string;
}

export interface TabOptions {
    tabSelector: string;
    panelAttr: string | null;
    paramKey: string;
    defaultTab: string;
    onChange?: (value: string) => void;
}

export interface TabController {
    switchTab: (value: string) => void;
}

export interface MenuElements {
    toggle: HTMLElement | null;
    close: HTMLElement | null;
    menu: HTMLElement | null;
    overlay: HTMLElement | null;
}