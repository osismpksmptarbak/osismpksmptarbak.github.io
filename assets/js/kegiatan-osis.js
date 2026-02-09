let currentImages = [];
let currentImageIndex = 0;

function getImageConfig() {
    if (typeof GALLERY_IMAGE_IDS === 'undefined' || !GALLERY_IMAGE_IDS || GALLERY_IMAGE_IDS.length === 0) {
        console.error('GALLERY_IMAGE_IDS not defined or empty');
        return { ids: [] };
    }
    return { ids: GALLERY_IMAGE_IDS };
}

function showError(message) {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const carouselContainer = document.getElementById('carouselContainer');
    
    loading.style.display = 'none';
    carouselContainer.style.display = 'none';
    error.style.display = 'flex';
    error.querySelector('p').textContent = message;
}

function loadImages() {
    const config = getImageConfig();
    
    if (!config.ids || config.ids.length === 0) {
        showError('No images configured yet. Please define GALLERY_IMAGE_IDS in the HTML file.');
        return;
    }

    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const carouselContainer = document.getElementById('carouselContainer');
    
    try {
        loading.style.display = 'flex';
        error.style.display = 'none';
        carouselContainer.style.display = 'none';

        currentImages = config.ids.map(id => ({
            id,
            thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w800`,
            fullUrl: `https://drive.google.com/uc?id=${id}&export=view`
        }));

        displayCarousel(currentImages);
        
        loading.style.display = 'none';
        carouselContainer.style.display = 'block';
    } catch (err) {
        console.error('Error loading images:', err);
        showError('Failed to load images. Please check GALLERY_IMAGE_IDS configuration.');
    }
}

function createImageElement(image, index) {
    const spinner = document.createElement('div');
    spinner.className = 'image-spinner';
    spinner.innerHTML = '<div class="spinner"></div>';
    
    const img = document.createElement('img');
    img.alt = `Kegiatan OSIS ${index + 1}`;
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
    
    return { spinner, img };
}

function displayCarousel(images) {
    const track = document.getElementById('carouselTrack');
    const indicators = document.getElementById('carouselIndicators');
    track.innerHTML = '';
    indicators.innerHTML = '';

    images.forEach((image, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        if (index === 0) slide.classList.add('active');
        
        const { spinner, img } = createImageElement(image, index);
        
        slide.appendChild(spinner);
        slide.appendChild(img);
        slide.onclick = () => openLightbox(index);
        track.appendChild(slide);
    });
    
    createPaginationDots(images.length, 0, indicators);
    preloadImages(images);
}

function createDot(index, currentPage) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.textContent = index + 1;
    if (index === currentPage) dot.classList.add('active');
    dot.onclick = () => goToSlide(index);
    dot.setAttribute('aria-label', `Slide ${index + 1}`);
    return dot;
}

function createPaginationDots(totalPages, currentPage, container) {
    container.innerHTML = '';
    const maxVisibleDots = 10;
    
    const firstBtn = document.createElement('button');
    firstBtn.className = 'carousel-dot carousel-nav-btn';
    firstBtn.innerHTML = '«';
    firstBtn.onclick = () => goToSlide(0);
    firstBtn.setAttribute('aria-label', 'First slide');
    firstBtn.disabled = currentPage === 0;
    container.appendChild(firstBtn);
    
    if (totalPages <= maxVisibleDots) {
        for (let i = 0; i < totalPages; i++) {
            container.appendChild(createDot(i, currentPage));
        }
    } else {
        const dots = [0];
        
        if (currentPage <= 2) {
            dots.push(1, 2, 3, 4, 'ellipsis', totalPages - 1);
        } else if (currentPage >= totalPages - 3) {
            dots.push('ellipsis', totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
        } else {
            dots.push('ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages - 1);
        }
        
        dots.forEach(index => {
            if (index === 'ellipsis') {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'carousel-ellipsis';
                ellipsis.textContent = '...';
                container.appendChild(ellipsis);
            } else {
                container.appendChild(createDot(index, currentPage));
            }
        });
    }
    
    const lastBtn = document.createElement('button');
    lastBtn.className = 'carousel-dot carousel-nav-btn';
    lastBtn.innerHTML = '»';
    lastBtn.onclick = () => goToSlide(totalPages - 1);
    lastBtn.setAttribute('aria-label', 'Last slide');
    lastBtn.disabled = currentPage === totalPages - 1;
    container.appendChild(lastBtn);
}

function preloadImages(images) {
    images.forEach(image => {
        const img = new Image();
        img.src = image.thumbnailUrl;
    });
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.getElementById('carouselIndicators');
    
    index = Math.max(0, Math.min(index, slides.length - 1));
    
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
    
    currentImageIndex = index;
    createPaginationDots(slides.length, index, indicators);
}

const nextSlide = () => goToSlide(currentImageIndex + 1);
const prevSlide = () => goToSlide(currentImageIndex - 1);

function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    
    lightboxImage.style.opacity = '0';
    lightboxImage.src = '';
    
    const img = new Image();
    const image = currentImages[currentImageIndex];
    
    img.onload = () => {
        lightboxImage.src = image.fullUrl;
        lightboxImage.style.opacity = '1';
    };
    img.onerror = () => {
        lightboxImage.src = image.thumbnailUrl;
        lightboxImage.style.opacity = '1';
    };
    img.src = image.fullUrl;
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function updateLightboxImage() {
    const lightboxImage = document.getElementById('lightboxImage');
    const image = currentImages[currentImageIndex];
    
    lightboxImage.style.opacity = '0';
    
    const img = new Image();
    img.onload = () => {
        lightboxImage.src = image.fullUrl;
        lightboxImage.style.opacity = '1';
    };
    img.onerror = () => {
        lightboxImage.src = image.thumbnailUrl;
        lightboxImage.style.opacity = '1';
    };
    img.src = image.fullUrl;
}

const nextImage = () => {
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    updateLightboxImage();
    goToSlide(currentImageIndex);
};

const prevImage = () => {
    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    updateLightboxImage();
    goToSlide(currentImageIndex);
};

document.getElementById('carouselNext')?.addEventListener('click', nextSlide);
document.getElementById('carouselPrev')?.addEventListener('click', prevSlide);
document.getElementById('closeLightbox')?.addEventListener('click', closeLightbox);
document.getElementById('nextImage')?.addEventListener('click', nextImage);
document.getElementById('prevImage')?.addEventListener('click', prevImage);

document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox.classList.contains('active')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    } else {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
    }
});

document.getElementById('lightbox')?.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
});

let touchStartX = 0;
let touchEndX = 0;

document.getElementById('carouselContainer')?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.getElementById('carouselContainer')?.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > 50) {
        diff > 0 ? nextSlide() : prevSlide();
    }
}, { passive: true });

document.addEventListener('DOMContentLoaded', loadImages);