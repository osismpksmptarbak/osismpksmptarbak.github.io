import { findById, clamp } from '../utils/dom.js';
// ---- Constants -----------------------------------------------------------------
/** Inline SVG placeholder shown when a thumbnail fails to load. */
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
 * - Touch/swipe with rubber-band resistance at the edges
 * - Responsive visible-card counts
 * - Switching between OSIS and MPK tracks without recreating the instance
 */
export class StructureCarousel {
    constructor() {
        this.activeTrack = null;
        this.currentIndex = 0;
        // Touch state
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isDragging = false;
        // Stored so we can cleanly re-bind swipe listeners when the track changes
        this.swipeListeners = null;
        this.prevBtn = findById('prevBtn');
        this.nextBtn = findById('nextBtn');
        this.prevBtn?.addEventListener('click', () => this.prev());
        this.nextBtn?.addEventListener('click', () => this.next());
        window.addEventListener('resize', () => this.update());
    }
    // ---- Layout helpers --------------------------------------------------------
    /**
     * Returns the per-step scroll distance by measuring the gap between the
     * left edges of the first two cards. This naturally includes card width
     * plus any gap/margin, so snapping is always accurate regardless of CSS.
     * Falls back to the container width when fewer than two cards exist.
     */
    getCardWidth() {
        if (!this.activeTrack)
            return 0;
        const cards = this.activeTrack.querySelectorAll('.divisi-card');
        if (cards.length >= 2) {
            return cards[1].getBoundingClientRect().left
                - cards[0].getBoundingClientRect().left;
        }
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
    /** Re-renders the carousel position and updates button disabled states. */
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
     * Previous swipe listeners are removed before the new ones are attached.
     */
    setTrack(trackEl, index = 0) {
        this.activeTrack = trackEl;
        this.currentIndex = index;
        this.bindSwipeListeners(trackEl);
        this.update();
    }
    // ---- Touch / swipe ---------------------------------------------------------
    bindSwipeListeners(trackEl) {
        this.swipeListeners?.abort();
        this.swipeListeners = new AbortController();
        const { signal } = this.swipeListeners;
        trackEl.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0]?.screenX ?? 0;
            this.touchStartY = e.changedTouches[0]?.screenY ?? 0;
            this.isDragging = false;
        }, { passive: true, signal });
        trackEl.addEventListener('touchmove', (e) => {
            const dx = (e.changedTouches[0]?.screenX ?? 0) - this.touchStartX;
            const dy = (e.changedTouches[0]?.screenY ?? 0) - this.touchStartY;
            // Let vertical swipes scroll the page normally
            if (!this.isDragging && Math.abs(dx) < Math.abs(dy))
                return;
            this.isDragging = true;
            const baseOffset = -this.currentIndex * this.getCardWidth();
            const atEdge = (dx > 0 && this.currentIndex === 0)
                || (dx < 0 && this.currentIndex >= this.getMaxIndex());
            this.setTranslate(baseOffset + (atEdge ? dx * 0.25 : dx), false);
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
export class GalleryCarousel {
    constructor(options) {
        this.currentIndex = 0;
        this.imgEls = [];
        this.slideEls = [];
        this.imageIds = options.imageIds ?? [];
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
        findById('carouselNext')?.addEventListener('click', () => this.next());
        findById('carouselPrev')?.addEventListener('click', () => this.prev());
        findById('closeLightbox')?.addEventListener('click', () => this.closeLightbox());
        findById('nextImage')?.addEventListener('click', () => this.next());
        findById('prevImage')?.addEventListener('click', () => this.prev());
        // Close lightbox on backdrop click
        this.els.lightbox.addEventListener('click', (e) => {
            if (e.target.id === 'lightbox')
                this.closeLightbox();
        });
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isLightboxOpen())
                this.closeLightbox();
            if (e.key === 'ArrowRight')
                this.next();
            if (e.key === 'ArrowLeft')
                this.prev();
        });
        // Touch swipe on the carousel container
        let touchStartX = 0;
        this.els.container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0]?.screenX ?? 0;
        }, { passive: true });
        this.els.container.addEventListener('touchend', (e) => {
            const dx = touchStartX - (e.changedTouches[0]?.screenX ?? 0);
            if (Math.abs(dx) > 50)
                dx > 0 ? this.next() : this.prev();
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
        this.imgEls = this.buildImageElements();
        this.renderSlides();
        this.els.loading.style.display = 'none';
        this.els.container.style.display = 'block';
    }
    buildImageElements() {
        return this.imageIds.map((id, index) => {
            const img = document.createElement('img');
            img.alt = `Documentation no. ${index + 1}`;
            img.src = `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
            img.onerror = () => { img.src = FALLBACK_SVG; };
            return img;
        });
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
        this.slideEls = this.imgEls.map((img, index) => {
            const slide = this.createSlide(img, index);
            this.els.track.appendChild(slide);
            return slide;
        });
        this.goToSlide(0);
    }
    createSlide(img, index) {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        const spinner = document.createElement('div');
        spinner.className = 'image-spinner';
        spinner.innerHTML = '<div class="spinner"></div>';
        img.addEventListener('load', () => { spinner.style.display = 'none'; img.style.opacity = '1'; }, { once: true });
        img.addEventListener('error', () => { spinner.style.display = 'none'; img.style.opacity = '1'; }, { once: true });
        slide.append(spinner, img);
        slide.addEventListener('click', () => this.openLightbox(index));
        return slide;
    }
    renderDots(currentPage) {
        const total = this.imgEls.length;
        const MAX_DOTS = 10;
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
            if (total <= MAX_DOTS)
                return Array.from({ length: total }, (_, i) => i);
            if (currentPage <= 2)
                return [0, 1, 2, 3, 4, 'ellipsis', total - 1];
            if (currentPage >= total - 3) {
                return [0, 'ellipsis', total - 5, total - 4, total - 3, total - 2, total - 1];
            }
            return [0, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', total - 1];
        };
        this.els.indicators.innerHTML = '';
        getDotItems().forEach(item => {
            this.els.indicators.appendChild(item === 'ellipsis' ? makeEllipsis() : makeDot(item));
        });
    }
    // ---- Navigation ------------------------------------------------------------
    goToSlide(index) {
        this.currentIndex = clamp(index, 0, this.slideEls.length - 1);
        this.slideEls.forEach((s, i) => s.classList.toggle('active', i === this.currentIndex));
        this.renderDots(this.currentIndex);
        if (this.isLightboxOpen())
            this.syncLightboxImage();
    }
    next() { this.goToSlide(this.currentIndex + 1); }
    prev() { this.goToSlide(this.currentIndex - 1); }
    // ---- Lightbox --------------------------------------------------------------
    isLightboxOpen() {
        return !this.els.lightbox.classList.contains('hidden');
    }
    openLightbox(index) {
        this.goToSlide(index);
        this.syncLightboxImage();
        this.els.lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    closeLightbox() {
        this.els.lightbox.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    syncLightboxImage() {
        const img = this.imgEls[this.currentIndex];
        if (!img)
            return;
        this.els.lightboxImage.src = img.src;
        this.els.lightboxImage.alt = img.alt;
        this.els.lightboxImage.style.opacity = '1';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    if (typeof GALLERY_IMAGE_IDS !== 'undefined') {
        new GalleryCarousel({ imageIds: GALLERY_IMAGE_IDS });
    }
});
//# sourceMappingURL=carousel.js.map