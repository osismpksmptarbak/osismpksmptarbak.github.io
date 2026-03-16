import type { CarouselOptions, GalleryImage, GalleryElements } from '../types.js';
import { findById, clamp, setUrlParam, getUrlParam } from '../utils/dom.js';

// ---- Structure carousel --------------------------------------------------------

export class StructureCarousel {
    private prevBtn: HTMLButtonElement | null;
    private nextBtn: HTMLButtonElement | null;
    private currentIndex: number = 0;
    private activeTrack: HTMLElement | null = null;

    constructor() {
        this.prevBtn = findById<HTMLButtonElement>('prevBtn');
        this.nextBtn = findById<HTMLButtonElement>('nextBtn');

        this.prevBtn?.addEventListener('click', () => this.prev());
        this.nextBtn?.addEventListener('click', () => this.next());
        window.addEventListener('resize', () => this.update());
    }

    private getCardWidth(): number {
        const w = window.innerWidth;
        if (w < 480) return 325;
        if (w < 768) return 345;
        return 395;
    }

    private getVisibleCards(): number {
        const w = window.innerWidth;
        if (w < 768) return 1;
        if (w < 1024) return 2;
        return 3;
    }

    private getMaxIndex(): number {
        if (!this.activeTrack) return 0;
        const total = this.activeTrack.querySelectorAll('.divisi-card').length;
        return Math.max(0, total - this.getVisibleCards());
    }

    update(): void {
        if (!this.activeTrack) return;

        const maxIndex = this.getMaxIndex();
        this.currentIndex = clamp(this.currentIndex, 0, maxIndex);
        this.activeTrack.style.transform = `translateX(-${this.currentIndex * this.getCardWidth()}px)`;

        if (this.prevBtn && this.nextBtn) {
            this.prevBtn.disabled = this.currentIndex === 0;
            this.nextBtn.disabled = this.currentIndex >= maxIndex;
        }

        setUrlParam('index', String(this.currentIndex));
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

    setTrack(trackEl: HTMLElement, index: number = 0): void {
        this.activeTrack = trackEl;
        this.currentIndex = index;
        this.update();
    }
}

// ---- Gallery carousel ----------------------------------------------------------

export class GalleryCarousel {
    private images: GalleryImage[] = [];
    private currentIndex: number = 0;
    private readonly imageIds: string[];
    private readonly altPrefix: string;
    private readonly els: GalleryElements;

    constructor(options: Required<Pick<CarouselOptions, 'imageIds' | 'altPrefix'>>) {
        this.imageIds = options.imageIds;
        this.altPrefix = options.altPrefix;

        this.els = {
            loading:      findById('loading')!,
            error:        findById('error')!,
            container:    findById('carouselContainer')!,
            track:        findById('carouselTrack')!,
            indicators:   findById('carouselIndicators')!,
            lightbox:     findById('lightbox')!,
            lightboxImage: findById<HTMLImageElement>('lightboxImage')!,
        };

        this.bindEvents();
        this.load();
    }

    private bindEvents(): void {
        findById('carouselNext')?.addEventListener('click', () => this.galleryNext());
        findById('carouselPrev')?.addEventListener('click', () => this.galleryPrev());
        findById('closeLightbox')?.addEventListener('click', () => this.closeLightbox());
        findById('nextImage')?.addEventListener('click', () => this.lightboxNext());
        findById('prevImage')?.addEventListener('click', () => this.lightboxPrev());

        this.els.lightbox?.addEventListener('click', (e: MouseEvent) => {
            if ((e.target as HTMLElement).id === 'lightbox') this.closeLightbox();
        });

        document.addEventListener('keydown', (e: KeyboardEvent) => {
            const lightboxOpen = this.els.lightbox?.classList.contains('active');
            if (lightboxOpen) {
                if (e.key === 'Escape')      this.closeLightbox();
                if (e.key === 'ArrowRight')  this.lightboxNext();
                if (e.key === 'ArrowLeft')   this.lightboxPrev();
            } else {
                if (e.key === 'ArrowRight')  this.galleryNext();
                if (e.key === 'ArrowLeft')   this.galleryPrev();
            }
        });

        let touchStartX = 0;
        this.els.container?.addEventListener('touchstart', (e: TouchEvent) => {
            touchStartX = e.changedTouches[0]?.screenX ?? 0;
        }, { passive: true });
        this.els.container?.addEventListener('touchend', (e: TouchEvent) => {
            const diff = touchStartX - (e.changedTouches[0]?.screenX ?? 0);
            if (Math.abs(diff) > 50) diff > 0 ? this.galleryNext() : this.galleryPrev();
        }, { passive: true });
    }

    private showError(message: string): void {
        this.els.loading.style.display = 'none';
        this.els.container.style.display = 'none';
        this.els.error.style.display = 'flex';
        const p = this.els.error.querySelector('p');
        if (p) p.textContent = message;
    }

    private load(): void {
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

    private renderSlides(): void {
        this.els.track.innerHTML = '';

        this.images.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = `carousel-slide${index === 0 ? ' active' : ''}`;

            const spinner = document.createElement('div');
            spinner.className = 'image-spinner';
            spinner.innerHTML = '<div class="spinner"></div>';

            const img = document.createElement('img');
            img.alt = `${this.altPrefix} ${index + 1}`;
            img.src = image.thumbnailUrl;
            img.onload = () => {
                spinner.style.display = 'none';
                img.style.opacity = '1';
            };
            img.onerror = () => {
                spinner.style.display = 'none';
                img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22600%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22800%22 height=%22600%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 text-anchor=%22middle%22 fill=%22%23999%22%3EImage not available%3C/text%3E%3C/svg%3E';
                img.style.opacity = '1';
            };

            slide.appendChild(spinner);
            slide.appendChild(img);
            slide.addEventListener('click', () => this.openLightbox(index));
            this.els.track.appendChild(slide);
        });

        this.renderDots(0);
        this.images.forEach(image => { new Image().src = image.thumbnailUrl; });
    }

    private renderDots(currentPage: number): void {
        const container = this.els.indicators;
        container.innerHTML = '';
        const total = this.images.length;
        const MAX_VISIBLE = 10;

        const makeDot = (index: number): HTMLButtonElement => {
            const btn = document.createElement('button');
            btn.className = `carousel-dot${index === currentPage ? ' active' : ''}`;
            btn.textContent = String(index + 1);
            btn.setAttribute('aria-label', `Slide ${index + 1}`);
            btn.addEventListener('click', () => this.goToSlide(index));
            return btn;
        };

        const makeNavBtn = (label: string, ariaLabel: string, targetIndex: number): HTMLButtonElement => {
            const btn = document.createElement('button');
            btn.className = 'carousel-dot carousel-nav-btn';
            btn.innerHTML = label;
            btn.setAttribute('aria-label', ariaLabel);
            btn.disabled = currentPage === targetIndex;
            btn.addEventListener('click', () => this.goToSlide(targetIndex));
            return btn;
        };

        const makeEllipsis = (): HTMLSpanElement => {
            const span = document.createElement('span');
            span.className = 'carousel-ellipsis';
            span.textContent = '...';
            return span;
        };

        type DotDescriptor = number | 'ellipsis';

        if (total <= MAX_VISIBLE) {
            for (let i = 0; i < total; i++) container.appendChild(makeDot(i));
        } else {
            let dots: DotDescriptor[];
            if (currentPage <= 2) {
                dots = [0, 1, 2, 3, 4, 'ellipsis', total - 1];
            } else if (currentPage >= total - 3) {
                dots = [0, 'ellipsis', total - 5, total - 4, total - 3, total - 2, total - 1];
            } else {
                dots = [0, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', total - 1];
            }
            dots.forEach(d => container.appendChild(d === 'ellipsis' ? makeEllipsis() : makeDot(d)));
        }
    }

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

    private openLightbox(index: number): void {
        this.currentIndex = index;
        const { lightbox, lightboxImage } = this.els;

        const slide = this.els.track.querySelectorAll<HTMLElement>('.carousel-slide')[index];
        const src = slide?.querySelector('img')?.src ?? '';

        lightboxImage.src = src;
        lightboxImage.style.opacity = '1';

        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    private closeLightbox(): void {
        this.els.lightbox.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    private loadLightboxImage(): void {
        const slide = this.els.track.querySelectorAll<HTMLElement>('.carousel-slide')[this.currentIndex];
        const src = slide?.querySelector('img')?.src ?? '';
        if (!src) return;

        this.els.lightboxImage.src = src;
        this.els.lightboxImage.style.opacity = '1';
    }

    private lightboxNext(): void {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.loadLightboxImage();
        this.goToSlide(this.currentIndex);
    }

    private lightboxPrev(): void {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.loadLightboxImage();
        this.goToSlide(this.currentIndex);
    }
}

// ---- Auto-init on DOMContentLoaded ---------------------------------------------

declare const GALLERY_IMAGE_IDS: string[] | undefined;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof GALLERY_IMAGE_IDS !== 'undefined') {
        new GalleryCarousel({ imageIds: GALLERY_IMAGE_IDS, altPrefix: 'Kegiatan OSIS' });
    }
});