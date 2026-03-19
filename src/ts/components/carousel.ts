import type { CarouselOptions, GalleryImage, GalleryElements } from '../types.js';
import { findById, clamp, setUrlParam, getUrlParam } from '../utils/dom.js';

// ---- Structure carousel --------------------------------------------------------

/**
 * Horizontally scrollable card carousel used on the "Struktur" section.
 *
 * Supports:
 * - Previous / next buttons
 * - Touch/swipe navigation with rubber-band resistance at the edges
 * - Responsive card widths and visible-card counts
 * - Switching between OSIS and MPK tracks without recreating the instance
 */
export class StructureCarousel {
    private prevBtn: HTMLButtonElement | null;
    private nextBtn: HTMLButtonElement | null;

    private activeTrack: HTMLElement | null = null;
    private currentIndex = 0;

    // Touch tracking
    private touchStartX = 0;
    private touchStartY = 0;
    private isDragging  = false;

    constructor() {
        this.prevBtn = findById<HTMLButtonElement>('prevBtn');
        this.nextBtn = findById<HTMLButtonElement>('nextBtn');

        this.prevBtn?.addEventListener('click', () => this.prev());
        this.nextBtn?.addEventListener('click', () => this.next());
        window.addEventListener('resize', () => this.update());
    }

    // ---- Layout helpers --------------------------------------------------------

    /**
     * Returns the true per-step scroll distance by measuring the distance
     * between the left edges of the first two cards.
     *
     * This naturally includes the card width *plus* any gap/margin, so the
     * carousel always snaps to exactly where the next card starts regardless
     * of CSS values. Falls back to the container width when fewer than two
     * cards are present.
     */
    private getCardWidth(): number {
        if (!this.activeTrack) return 0;

        const cards = this.activeTrack.querySelectorAll<HTMLElement>('.divisi-card');
        if (cards.length >= 2) {
            const first  = cards[0]!.getBoundingClientRect();
            const second = cards[1]!.getBoundingClientRect();
            return second.left - first.left;
        }

        // Fallback: treat the whole track as one step
        return this.activeTrack.getBoundingClientRect().width;
    }

    private getVisibleCards(): number {
        const w = window.innerWidth;
        if (w < 768)  return 1;
        if (w < 1024) return 2;
        return 3;
    }

    private getMaxIndex(): number {
        if (!this.activeTrack) return 0;
        const totalCards = this.activeTrack.querySelectorAll('.divisi-card').length;
        return Math.max(0, totalCards - this.getVisibleCards());
    }

    // ---- Track transform -------------------------------------------------------

    private setTranslate(px: number, animated: boolean): void {
        if (!this.activeTrack) return;
        this.activeTrack.style.transition = animated ? 'transform 0.35s ease' : 'none';
        this.activeTrack.style.transform  = `translateX(${px}px)`;
    }

    // ---- Public API ------------------------------------------------------------

    /** Re-renders position and updates button disabled states. */
    update(): void {
        if (!this.activeTrack) return;

        const maxIndex = this.getMaxIndex();
        this.currentIndex = clamp(this.currentIndex, 0, maxIndex);
        this.setTranslate(-this.currentIndex * this.getCardWidth(), true);

        if (this.prevBtn) this.prevBtn.disabled = this.currentIndex === 0;
        if (this.nextBtn) this.nextBtn.disabled = this.currentIndex >= maxIndex;
    }

    prev(): void {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.update();
        }
    }

    next(): void {
        if (this.currentIndex < this.getMaxIndex()) {
            this.currentIndex++;
            this.update();
        }
    }

    /**
     * Points the carousel at a new track element and optionally seeks to an index.
     * Call this whenever the user switches between OSIS and MPK.
     */
    setTrack(trackEl: HTMLElement, index = 0): void {
        this.activeTrack  = trackEl;
        this.currentIndex = index;
        this.bindSwipe(trackEl);
        this.update();
    }

    // ---- Touch / swipe ---------------------------------------------------------

    private bindSwipe(trackEl: HTMLElement): void {
        trackEl.addEventListener('touchstart', (e: TouchEvent) => {
            this.touchStartX = e.changedTouches[0]?.screenX ?? 0;
            this.touchStartY = e.changedTouches[0]?.screenY ?? 0;
            this.isDragging  = false;
        }, { passive: true });

        trackEl.addEventListener('touchmove', (e: TouchEvent) => {
            const dx = (e.changedTouches[0]?.screenX ?? 0) - this.touchStartX;
            const dy = (e.changedTouches[0]?.screenY ?? 0) - this.touchStartY;

            // Let vertical swipes scroll the page
            if (!this.isDragging && Math.abs(dx) < Math.abs(dy)) return;
            this.isDragging = true;

            const baseOffset = -this.currentIndex * this.getCardWidth();
            const atEdge     = (dx > 0 && this.currentIndex === 0)
                            || (dx < 0 && this.currentIndex >= this.getMaxIndex());

            // Apply rubber-band resistance at the edges
            const drag = atEdge ? dx * 0.25 : dx;
            this.setTranslate(baseOffset + drag, false);
        }, { passive: true });

        trackEl.addEventListener('touchend', (e: TouchEvent) => {
            const dx = this.touchStartX - (e.changedTouches[0]?.screenX ?? 0);
            const dy = this.touchStartY - (e.changedTouches[0]?.screenY ?? 0);

            if (this.isDragging && Math.abs(dx) > Math.abs(dy)) {
                dx > 0 ? this.next() : this.prev();
            }
            this.isDragging = false;
        }, { passive: true });
    }
}

// ---- Gallery carousel ----------------------------------------------------------

/**
 * Full-featured image gallery carousel backed by Google Drive thumbnails.
 *
 * Features:
 * - Lazy-loaded slides with per-image spinners
 * - Paginated dot indicators with ellipsis for large galleries
 * - Lightbox with keyboard navigation (←, →, Esc) and click-outside-to-close
 * - Touch swipe support
 * - Preloads all thumbnails in the background after initial render
 */
export class GalleryCarousel {
    private images:       GalleryImage[] = [];
    private currentIndex  = 0;

    private readonly imageIds:   string[];
    private readonly altPrefix:  string;
    private readonly els:        GalleryElements;

    constructor(options: Required<Pick<CarouselOptions, 'imageIds' | 'altPrefix'>>) {
        this.imageIds  = options.imageIds;
        this.altPrefix = options.altPrefix;

        this.els = {
            loading:       findById('loading')!,
            error:         findById('error')!,
            container:     findById('carouselContainer')!,
            track:         findById('carouselTrack')!,
            indicators:    findById('carouselIndicators')!,
            lightbox:      findById('lightbox')!,
            lightboxImage: findById<HTMLImageElement>('lightboxImage')!,
        };

        this.bindEvents();
        this.load();
    }

    // ---- Events ----------------------------------------------------------------

    private bindEvents(): void {
        findById('carouselNext')?.addEventListener('click', () => this.galleryNext());
        findById('carouselPrev')?.addEventListener('click', () => this.galleryPrev());
        findById('closeLightbox')?.addEventListener('click', () => this.closeLightbox());
        findById('nextImage')?.addEventListener('click',  () => this.lightboxNext());
        findById('prevImage')?.addEventListener('click',  () => this.lightboxPrev());

        // Close lightbox when clicking the backdrop
        this.els.lightbox?.addEventListener('click', (e: MouseEvent) => {
            if ((e.target as HTMLElement).id === 'lightbox') this.closeLightbox();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            const lightboxOpen = this.els.lightbox?.classList.contains('active');
            if (lightboxOpen) {
                if (e.key === 'Escape')     this.closeLightbox();
                if (e.key === 'ArrowRight') this.lightboxNext();
                if (e.key === 'ArrowLeft')  this.lightboxPrev();
            } else {
                if (e.key === 'ArrowRight') this.galleryNext();
                if (e.key === 'ArrowLeft')  this.galleryPrev();
            }
        });

        // Touch swipe on the carousel container
        let touchStartX = 0;
        this.els.container?.addEventListener('touchstart', (e: TouchEvent) => {
            touchStartX = e.changedTouches[0]?.screenX ?? 0;
        }, { passive: true });
        this.els.container?.addEventListener('touchend', (e: TouchEvent) => {
            const dx = touchStartX - (e.changedTouches[0]?.screenX ?? 0);
            if (Math.abs(dx) > 50) dx > 0 ? this.galleryNext() : this.galleryPrev();
        }, { passive: true });
    }

    // ---- Loading ---------------------------------------------------------------

    private load(): void {
        if (!this.imageIds.length) {
            this.showError('No images configured yet. Please define GALLERY_IMAGE_IDS in the HTML file.');
            return;
        }

        this.els.loading.style.display   = 'flex';
        this.els.error.style.display     = 'none';
        this.els.container.style.display = 'none';

        this.images = this.imageIds.map(id => ({
            id,
            thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w800`,
        }));

        this.renderSlides();

        this.els.loading.style.display   = 'none';
        this.els.container.style.display = 'block';
    }

    private showError(message: string): void {
        this.els.loading.style.display   = 'none';
        this.els.container.style.display = 'none';
        this.els.error.style.display     = 'flex';
        const p = this.els.error.querySelector('p');
        if (p) p.textContent = message;
    }

    // ---- Rendering -------------------------------------------------------------

    private renderSlides(): void {
        this.els.track.innerHTML = '';

        this.images.forEach((image, index) => {
            const slide = this.createSlide(image, index);
            this.els.track.appendChild(slide);
        });

        this.renderDots(0);

        // Background-preload all images so they feel instant when navigated to
        this.images.forEach(image => { new Image().src = image.thumbnailUrl; });
    }

    private createSlide(image: GalleryImage, index: number): HTMLElement {
        const slide = document.createElement('div');
        slide.className = `carousel-slide${index === 0 ? ' active' : ''}`;

        const spinner = document.createElement('div');
        spinner.className = 'image-spinner';
        spinner.innerHTML = '<div class="spinner"></div>';

        const img   = document.createElement('img');
        img.alt     = `${this.altPrefix} ${index + 1}`;
        img.src     = image.thumbnailUrl;
        img.onload  = () => { spinner.style.display = 'none'; img.style.opacity = '1'; };
        img.onerror = () => {
            spinner.style.display = 'none';
            img.src = FALLBACK_SVG;
            img.style.opacity = '1';
        };

        slide.appendChild(spinner);
        slide.appendChild(img);
        slide.addEventListener('click', () => this.openLightbox(index));

        return slide;
    }

    private renderDots(currentPage: number): void {
        const container = this.els.indicators;
        container.innerHTML = '';

        const total       = this.images.length;
        const MAX_VISIBLE = 10;

        const makeDot = (index: number): HTMLButtonElement => {
            const btn = document.createElement('button');
            btn.className   = `carousel-dot${index === currentPage ? ' active' : ''}`;
            btn.textContent = String(index + 1);
            btn.setAttribute('aria-label', `Slide ${index + 1}`);
            btn.addEventListener('click', () => this.goToSlide(index));
            return btn;
        };

        const makeEllipsis = (): HTMLSpanElement => {
            const span = document.createElement('span');
            span.className   = 'carousel-ellipsis';
            span.textContent = '...';
            return span;
        };

        type DotItem = number | 'ellipsis';

        const getDotItems = (): DotItem[] => {
            if (total <= MAX_VISIBLE) {
                return Array.from({ length: total }, (_, i) => i);
            }
            if (currentPage <= 2) {
                return [0, 1, 2, 3, 4, 'ellipsis', total - 1];
            }
            if (currentPage >= total - 3) {
                return [0, 'ellipsis', total - 5, total - 4, total - 3, total - 2, total - 1];
            }
            return [0, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', total - 1];
        };

        getDotItems().forEach(item => {
            container.appendChild(item === 'ellipsis' ? makeEllipsis() : makeDot(item));
        });
    }

    // ---- Navigation ------------------------------------------------------------

    goToSlide(index: number): void {
        const slides = this.els.track.querySelectorAll<HTMLElement>('.carousel-slide');
        index = clamp(index, 0, slides.length - 1);

        slides.forEach(s => s.classList.remove('active'));
        slides[index]?.classList.add('active');

        this.currentIndex = index;
        this.renderDots(index);
    }

    galleryNext(): void { this.goToSlide(this.currentIndex + 1); }
    galleryPrev(): void { this.goToSlide(this.currentIndex - 1); }

    // ---- Lightbox --------------------------------------------------------------

    private openLightbox(index: number): void {
        this.currentIndex = index;
        const src = this.getSlideImageSrc(index);

        this.els.lightboxImage.src          = src;
        this.els.lightboxImage.style.opacity = '1';
        this.els.lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    private closeLightbox(): void {
        this.els.lightbox.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    private lightboxNext(): void {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.syncLightboxImage();
        this.goToSlide(this.currentIndex);
    }

    private lightboxPrev(): void {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.syncLightboxImage();
        this.goToSlide(this.currentIndex);
    }

    private syncLightboxImage(): void {
        const src = this.getSlideImageSrc(this.currentIndex);
        if (!src) return;
        this.els.lightboxImage.src          = src;
        this.els.lightboxImage.style.opacity = '1';
    }

    private getSlideImageSrc(index: number): string {
        const slides = this.els.track.querySelectorAll<HTMLElement>('.carousel-slide');
        return slides[index]?.querySelector('img')?.src ?? '';
    }
}

// ---- Constants -----------------------------------------------------------------

/** Inline SVG shown when a thumbnail fails to load. */
const FALLBACK_SVG =
    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22600%22%3E' +
    '%3Crect fill=%22%23f0f0f0%22 width=%22800%22 height=%22600%22/%3E' +
    '%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 text-anchor=%22middle%22 fill=%22%23999%22%3E' +
    'Image not available%3C/text%3E%3C/svg%3E';

// ---- Auto-init on DOMContentLoaded ---------------------------------------------

declare const GALLERY_IMAGE_IDS: string[] | undefined;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof GALLERY_IMAGE_IDS !== 'undefined') {
        new GalleryCarousel({ imageIds: GALLERY_IMAGE_IDS, altPrefix: 'Kegiatan OSIS' });
    }
});