import { findById, clamp } from '../utils/dom.js';
// ---- Constants -----------------------------------------------------------------
/** Inline SVG shown when a thumbnail fails to load. */
const FALLBACK_SVG = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22600%22%3E' +
    '%3Crect fill=%22%23f0f0f0%22 width=%22800%22 height=%22600%22/%3E' +
    '%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 text-anchor=%22middle%22 fill=%22%23999%22%3E' +
    'Image not available%3C/text%3E%3C/svg%3E';
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
    constructor() {
        this.activeTrack = null;
        this.currentIndex = 0;
        // Touch tracking
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isDragging = false;
        // Keep a reference to the bound swipe handler so we can remove it before
        // re-binding when the track changes, preventing duplicate listeners.
        this.swipeAbortController = null;
        this.prevBtn = findById('prevBtn');
        this.nextBtn = findById('nextBtn');
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
    getCardWidth() {
        if (!this.activeTrack)
            return 0;
        const cards = this.activeTrack.querySelectorAll('.divisi-card');
        if (cards.length >= 2) {
            const first = cards[0].getBoundingClientRect();
            const second = cards[1].getBoundingClientRect();
            return second.left - first.left;
        }
        // Fallback: treat the whole track as one step
        return this.activeTrack.getBoundingClientRect().width;
    }
    getVisibleCards() {
        const w = window.innerWidth;
        if (w < 768)
            return 1;
        if (w < 1024)
            return 2;
        return 3;
    }
    getMaxIndex() {
        if (!this.activeTrack)
            return 0;
        const totalCards = this.activeTrack.querySelectorAll('.divisi-card').length;
        return Math.max(0, totalCards - this.getVisibleCards());
    }
    // ---- Track transform -------------------------------------------------------
    setTranslate(px, animated) {
        if (!this.activeTrack)
            return;
        this.activeTrack.style.transition = animated ? 'transform 0.35s ease' : 'none';
        this.activeTrack.style.transform = `translateX(${px}px)`;
    }
    // ---- Public API ------------------------------------------------------------
    /** Re-renders position and updates button disabled states. */
    update() {
        if (!this.activeTrack)
            return;
        const maxIndex = this.getMaxIndex();
        this.currentIndex = clamp(this.currentIndex, 0, maxIndex);
        this.setTranslate(-this.currentIndex * this.getCardWidth(), true);
        if (this.prevBtn)
            this.prevBtn.disabled = this.currentIndex === 0;
        if (this.nextBtn)
            this.nextBtn.disabled = this.currentIndex >= maxIndex;
    }
    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.update();
        }
    }
    next() {
        if (this.currentIndex < this.getMaxIndex()) {
            this.currentIndex++;
            this.update();
        }
    }
    /**
     * Points the carousel at a new track element and optionally seeks to an index.
     * Call this whenever the user switches between OSIS and MPK.
     *
     * Any previous swipe listeners on the old track are removed before the new
     * ones are attached, preventing duplicate handlers from accumulating.
     */
    setTrack(trackEl, index = 0) {
        this.activeTrack = trackEl;
        this.currentIndex = index;
        this.bindSwipe(trackEl);
        this.update();
    }
    // ---- Touch / swipe ---------------------------------------------------------
    bindSwipe(trackEl) {
        // Remove listeners from the previous track (or the same track on re-bind)
        this.swipeAbortController?.abort();
        this.swipeAbortController = new AbortController();
        const { signal } = this.swipeAbortController;
        trackEl.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0]?.screenX ?? 0;
            this.touchStartY = e.changedTouches[0]?.screenY ?? 0;
            this.isDragging = false;
        }, { passive: true, signal });
        trackEl.addEventListener('touchmove', (e) => {
            const dx = (e.changedTouches[0]?.screenX ?? 0) - this.touchStartX;
            const dy = (e.changedTouches[0]?.screenY ?? 0) - this.touchStartY;
            // Let vertical swipes scroll the page
            if (!this.isDragging && Math.abs(dx) < Math.abs(dy))
                return;
            this.isDragging = true;
            const baseOffset = -this.currentIndex * this.getCardWidth();
            const atEdge = (dx > 0 && this.currentIndex === 0)
                || (dx < 0 && this.currentIndex >= this.getMaxIndex());
            // Apply rubber-band resistance at the edges
            const drag = atEdge ? dx * 0.25 : dx;
            this.setTranslate(baseOffset + drag, false);
        }, { passive: true, signal });
        trackEl.addEventListener('touchend', (e) => {
            const dx = this.touchStartX - (e.changedTouches[0]?.screenX ?? 0);
            const dy = this.touchStartY - (e.changedTouches[0]?.screenY ?? 0);
            if (this.isDragging && Math.abs(dx) > Math.abs(dy)) {
                dx > 0 ? this.next() : this.prev();
            }
            this.isDragging = false;
        }, { passive: true, signal });
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
    constructor(options) {
        this.images = [];
        /** Index of the currently visible slide in the main carousel. */
        this.currentIndex = 0;
        /**
         * Index of the image shown in the lightbox.
         * Kept separate from `currentIndex` so that lightbox navigation
         * does not silently shift the main gallery position while it is open.
         */
        this.lightboxIndex = 0;
        this.imageIds = options.imageIds;
        this.altPrefix = options.altPrefix;
        this.els = {
            loading: findById('loading'),
            error: findById('error'),
            container: findById('carouselContainer'),
            track: findById('carouselTrack'),
            indicators: findById('carouselIndicators'),
            lightbox: findById('lightbox'),
            lightboxImage: findById('lightboxImage'),
        };
        this.bindEvents();
        this.load();
    }
    // ---- Events ----------------------------------------------------------------
    bindEvents() {
        findById('carouselNext')?.addEventListener('click', () => this.galleryNext());
        findById('carouselPrev')?.addEventListener('click', () => this.galleryPrev());
        findById('closeLightbox')?.addEventListener('click', () => this.closeLightbox());
        findById('nextImage')?.addEventListener('click', () => this.lightboxNext());
        findById('prevImage')?.addEventListener('click', () => this.lightboxPrev());
        // Close lightbox when clicking the backdrop
        this.els.lightbox?.addEventListener('click', (e) => {
            if (e.target.id === 'lightbox')
                this.closeLightbox();
        });
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.els.lightbox.classList.contains('hidden')) {
                if (e.key === 'Escape')
                    this.closeLightbox();
                if (e.key === 'ArrowRight')
                    this.lightboxNext();
                if (e.key === 'ArrowLeft')
                    this.lightboxPrev();
            }
            else {
                if (e.key === 'ArrowRight')
                    this.galleryNext();
                if (e.key === 'ArrowLeft')
                    this.galleryPrev();
            }
        });
        // Touch swipe on the carousel container
        let touchStartX = 0;
        this.els.container?.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0]?.screenX ?? 0;
        }, { passive: true });
        this.els.container?.addEventListener('touchend', (e) => {
            const dx = touchStartX - (e.changedTouches[0]?.screenX ?? 0);
            if (Math.abs(dx) > 50)
                dx > 0 ? this.galleryNext() : this.galleryPrev();
        }, { passive: true });
    }
    // ---- Loading ---------------------------------------------------------------
    load() {
        if (!this.imageIds.length) {
            this.showError('No images configured yet. Please define GALLERY_IMAGE_IDS in the HTML file.');
            return;
        }
        this.els.loading.style.display = 'flex';
        this.els.error.style.display = 'none';
        this.els.container.style.display = 'none';
        this.images = this.imageIds.map(id => ({
            id,
            thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w800`,
        }));
        this.renderSlides();
        this.els.loading.style.display = 'none';
        this.els.container.style.display = 'block';
    }
    showError(message) {
        this.els.loading.style.display = 'none';
        this.els.container.style.display = 'none';
        this.els.error.style.display = 'flex';
        const p = this.els.error.querySelector('p');
        if (p)
            p.textContent = message;
    }
    // ---- Rendering -------------------------------------------------------------
    renderSlides() {
        this.els.track.innerHTML = '';
        this.images.forEach((image, index) => {
            const slide = this.createSlide(image, index);
            this.els.track.appendChild(slide);
        });
        this.renderDots(0);
        // Background-preload all images so they feel instant when navigated to
        this.images.forEach(image => { new Image().src = image.thumbnailUrl; });
    }
    createSlide(image, index) {
        const slide = document.createElement('div');
        slide.className = `carousel-slide${index === 0 ? ' active' : ''}`;
        const spinner = document.createElement('div');
        spinner.className = 'image-spinner';
        spinner.innerHTML = '<div class="spinner"></div>';
        const img = document.createElement('img');
        img.alt = `${this.altPrefix} ${index + 1}`;
        img.src = image.thumbnailUrl;
        img.onload = () => { spinner.style.display = 'none'; img.style.opacity = '1'; };
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
    renderDots(currentPage) {
        const container = this.els.indicators;
        container.innerHTML = '';
        const total = this.images.length;
        const MAX_VISIBLE = 10;
        const makeDot = (index) => {
            const btn = document.createElement('button');
            btn.className = `carousel-dot${index === currentPage ? ' active' : ''}`;
            btn.textContent = String(index + 1);
            btn.setAttribute('aria-label', `Slide ${index + 1}`);
            btn.addEventListener('click', () => this.goToSlide(index));
            return btn;
        };
        const makeEllipsis = () => {
            const span = document.createElement('span');
            span.className = 'carousel-ellipsis';
            span.textContent = '...';
            return span;
        };
        const getDotItems = () => {
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
    goToSlide(index) {
        const slides = this.els.track.querySelectorAll('.carousel-slide');
        index = clamp(index, 0, slides.length - 1);
        slides.forEach(s => s.classList.remove('active'));
        slides[index]?.classList.add('active');
        this.currentIndex = index;
        this.renderDots(index);
    }
    galleryNext() { this.goToSlide(this.currentIndex + 1); }
    galleryPrev() { this.goToSlide(this.currentIndex - 1); }
    // ---- Lightbox --------------------------------------------------------------
    openLightbox(index) {
        this.lightboxIndex = index;
        this.syncLightboxImage();
        this.els.lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    closeLightbox() {
        // Sync the main gallery to wherever the user ended up in the lightbox
        this.goToSlide(this.lightboxIndex);
        this.els.lightbox.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    lightboxNext() {
        this.lightboxIndex = (this.lightboxIndex + 1) % this.images.length;
        this.syncLightboxImage();
    }
    lightboxPrev() {
        this.lightboxIndex = (this.lightboxIndex - 1 + this.images.length) % this.images.length;
        this.syncLightboxImage();
    }
    syncLightboxImage() {
        const src = this.getSlideImageSrc(this.lightboxIndex);
        if (!src)
            return;
        this.els.lightboxImage.src = src;
        this.els.lightboxImage.style.opacity = '1';
    }
    getSlideImageSrc(index) {
        const slides = this.els.track.querySelectorAll('.carousel-slide');
        return slides[index]?.querySelector('img')?.src ?? '';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    if (typeof GALLERY_IMAGE_IDS !== 'undefined') {
        new GalleryCarousel({ imageIds: GALLERY_IMAGE_IDS, altPrefix: 'Kegiatan OSIS' });
    }
});
//# sourceMappingURL=carousel.js.map