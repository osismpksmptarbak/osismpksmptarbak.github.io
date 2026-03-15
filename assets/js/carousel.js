class Carousel {
    constructor(options = {}) {
        options.mode === 'gallery' ? this._initGallery(options) : this._initStructure();
    }

    _initStructure() {
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentIndex = 0;
        this.activeTrack = null;

        this.prevBtn?.addEventListener('click', () => this._structurePrev());
        this.nextBtn?.addEventListener('click', () => this._structureNext());
        window.addEventListener('resize', () => this._structureUpdate());
    }

    _getCardWidth() {
        const w = window.innerWidth;
        if (w < 480) return 325;
        if (w < 768) return 345;
        return 395;
    }

    _getVisibleCards() {
        const w = window.innerWidth;
        if (w < 768) return 1;
        if (w < 1024) return 2;
        return 3;
    }

    _structureUpdate() {
        if (!this.activeTrack) return;

        const totalCards = this.activeTrack.querySelectorAll('.divisi-card').length;
        const maxIndex = Math.max(0, totalCards - this._getVisibleCards());

        this.currentIndex = Math.max(0, Math.min(this.currentIndex, maxIndex));
        this.activeTrack.style.transform = `translateX(-${this.currentIndex * this._getCardWidth()}px)`;

        if (this.prevBtn && this.nextBtn) {
            this.prevBtn.disabled = this.currentIndex === 0;
            this.nextBtn.disabled = this.currentIndex >= maxIndex;
        }

        const url = new URL(window.location);
        url.searchParams.set('index', this.currentIndex);
        window.history.replaceState({}, '', url);
    }

    _structurePrev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this._structureUpdate();
        }
    }

    _structureNext() {
        if (!this.activeTrack) return;
        const totalCards = this.activeTrack.querySelectorAll('.divisi-card').length;
        const maxIndex = Math.max(0, totalCards - this._getVisibleCards());
        if (this.currentIndex < maxIndex) {
            this.currentIndex++;
            this._structureUpdate();
        }
    }

    setTrack(trackEl, index = 0) {
        this.activeTrack = trackEl;
        this.currentIndex = index;
        this._structureUpdate();
    }

    _initGallery(options) {
        this.images = [];
        this.currentIndex = 0;
        this.imageIds = options.imageIds || [];
        this.altPrefix = options.altPrefix || 'Image';

        this.els = {
            loading: document.getElementById('loading'),
            error: document.getElementById('error'),
            container: document.getElementById('carouselContainer'),
            track: document.getElementById('carouselTrack'),
            indicators: document.getElementById('carouselIndicators'),
            lightbox: document.getElementById('lightbox'),
            lightboxImage: document.getElementById('lightboxImage'),
        };

        document.getElementById('carouselNext')?.addEventListener('click', () => this._galleryNext());
        document.getElementById('carouselPrev')?.addEventListener('click', () => this._galleryPrev());
        document.getElementById('closeLightbox')?.addEventListener('click', () => this._closeLightbox());
        document.getElementById('nextImage')?.addEventListener('click', () => this._lightboxNext());
        document.getElementById('prevImage')?.addEventListener('click', () => this._lightboxPrev());

        this.els.lightbox?.addEventListener('click', (e) => {
            if (e.target.id === 'lightbox') this._closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (this.els.lightbox?.classList.contains('active')) {
                if (e.key === 'Escape') this._closeLightbox();
                if (e.key === 'ArrowRight') this._lightboxNext();
                if (e.key === 'ArrowLeft') this._lightboxPrev();
            } else {
                if (e.key === 'ArrowRight') this._galleryNext();
                if (e.key === 'ArrowLeft') this._galleryPrev();
            }
        });

        let touchStartX = 0;
        this.els.container?.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        this.els.container?.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) diff > 0 ? this._galleryNext() : this._galleryPrev();
        }, { passive: true });

        this._load();
    }

    _showError(message) {
        this.els.loading.style.display = 'none';
        this.els.container.style.display = 'none';
        this.els.error.style.display = 'flex';
        this.els.error.querySelector('p').textContent = message;
    }

    _load() {
        if (!this.imageIds.length) {
            this._showError('No images configured yet. Please define GALLERY_IMAGE_IDS in the HTML file.');
            return;
        }

        this.els.loading.style.display = 'flex';
        this.els.error.style.display = 'none';
        this.els.container.style.display = 'none';

        this.images = this.imageIds.map(id => ({
            id,
            thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w800`,
            fullUrl: `https://drive.google.com/uc?id=${id}&export=view`,
        }));

        this._renderSlides();
        this.els.loading.style.display = 'none';
        this.els.container.style.display = 'block';
    }

    _renderSlides() {
        this.els.track.innerHTML = '';

        this.images.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide' + (index === 0 ? ' active' : '');

            const spinner = document.createElement('div');
            spinner.className = 'image-spinner';
            spinner.innerHTML = '<div class="spinner"></div>';

            const img = document.createElement('img');
            img.alt = `${this.altPrefix} ${index + 1}`;
            img.src = image.thumbnailUrl;
            img.onload = () => { spinner.style.display = 'none'; img.style.opacity = '1'; };
            img.onerror = () => {
                spinner.style.display = 'none';
                img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22600%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22800%22 height=%22600%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 text-anchor=%22middle%22 fill=%22%23999%22%3EImage not available%3C/text%3E%3C/svg%3E';
                img.style.opacity = '1';
            };

            slide.appendChild(spinner);
            slide.appendChild(img);
            slide.onclick = () => this._openLightbox(index);
            this.els.track.appendChild(slide);
        });

        this._renderDots(0);
        this.images.forEach(image => { const img = new Image(); img.src = image.thumbnailUrl; });
    }

    _renderDots(currentPage) {
        const container = this.els.indicators;
        container.innerHTML = '';
        const total = this.images.length;
        const maxVisible = 10;

        const makeNavBtn = (label, ariaLabel, targetIndex) => {
            const btn = document.createElement('button');
            btn.className = 'carousel-dot carousel-nav-btn';
            btn.innerHTML = label;
            btn.setAttribute('aria-label', ariaLabel);
            btn.disabled = currentPage === targetIndex;
            btn.onclick = () => this._goToSlide(targetIndex);
            return btn;
        };

        const makeDot = (index) => {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (index === currentPage ? ' active' : '');
            dot.textContent = index + 1;
            dot.setAttribute('aria-label', `Slide ${index + 1}`);
            dot.onclick = () => this._goToSlide(index);
            return dot;
        };

        const makeEllipsis = () => {
            const span = document.createElement('span');
            span.className = 'carousel-ellipsis';
            span.textContent = '...';
            return span;
        };

        if (total <= maxVisible) {
            for (let i = 0; i < total; i++) container.appendChild(makeDot(i));
        } else {
            let dots;
            if (currentPage <= 2) {
                dots = [0, 1, 2, 3, 4, 'ellipsis', total - 1];
            } else if (currentPage >= total - 3) {
                dots = [0, 'ellipsis', total - 5, total - 4, total - 3, total - 2, total - 1];
            } else {
                dots = [0, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', total - 1];
            }
            dots.forEach(i => container.appendChild(i === 'ellipsis' ? makeEllipsis() : makeDot(i)));
        }
    }

    _goToSlide(index) {
        const slides = this.els.track.querySelectorAll('.carousel-slide');
        index = Math.max(0, Math.min(index, slides.length - 1));
        slides.forEach(s => s.classList.remove('active'));
        slides[index].classList.add('active');
        this.currentIndex = index;
        this._renderDots(index);
    }

    _galleryNext() { this._goToSlide(this.currentIndex + 1); }
    _galleryPrev() { this._goToSlide(this.currentIndex - 1); }

    _openLightbox(index) {
        this.currentIndex = index;
        const { lightbox, lightboxImage } = this.els;
        lightboxImage.style.opacity = '0';
        lightboxImage.src = '';
        this._loadLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    _closeLightbox() {
        this.els.lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    _loadLightboxImage() {
        const image = this.images[this.currentIndex];
        const { lightboxImage } = this.els;
        const img = new Image();
        img.onload = () => { lightboxImage.src = image.fullUrl; lightboxImage.style.opacity = '1'; };
        img.onerror = () => { lightboxImage.src = image.thumbnailUrl; lightboxImage.style.opacity = '1'; };
        img.src = image.fullUrl;
    }

    _lightboxNext() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this._loadLightboxImage();
        this._goToSlide(this.currentIndex);
    }

    _lightboxPrev() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this._loadLightboxImage();
        this._goToSlide(this.currentIndex);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof GALLERY_IMAGE_IDS !== 'undefined') {
        new Carousel({ mode: 'gallery', imageIds: GALLERY_IMAGE_IDS, altPrefix: 'Kegiatan OSIS' });
    }
});