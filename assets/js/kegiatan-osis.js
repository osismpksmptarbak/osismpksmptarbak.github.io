let currentImages = [];
let currentImageIndex = 0;

// Get image configuration from global variables
function getImageConfig() {
    if (typeof GALLERY_IMAGE_IDS === 'undefined' || !GALLERY_IMAGE_IDS || GALLERY_IMAGE_IDS.length === 0) {
        console.error('GALLERY_IMAGE_IDS not defined or empty');
        return { ids: [] };
    }
    
    const ids = GALLERY_IMAGE_IDS;
    return { ids };
}

// Check if images are configured
function checkConfiguration() {
    const config = getImageConfig();
    
    if (!config.ids || config.ids.length === 0) {
        showError('Belum ada gambar yang dikonfigurasi. Silakan definisikan GALLERY_IMAGE_IDS di HTML file.');
        return false;
    }
    return true;
}

// Load images from configured IDs
function loadImages() {
    if (!checkConfiguration()) {
        return;
    }

    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const carouselContainer = document.getElementById('carouselContainer');
    
    try {
        loading.style.display = 'flex';
        error.style.display = 'none';
        carouselContainer.style.display = 'none';

        const config = getImageConfig();
        const { ids } = config;

        currentImages = ids.map((id, index) => ({
            id: id,
            thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w800`,
            fullUrl: `https://drive.google.com/uc?id=${id}&export=view`
        }));

        displayCarousel(currentImages);
        
        loading.style.display = 'none';
        carouselContainer.style.display = 'block';
    } catch (err) {
        console.error('Error loading images:', err);
        showError('Gagal memuat gambar. Periksa konfigurasi GALLERY_IMAGE_IDS.');
    }
}

// Display images in carousel
function displayCarousel(images) {
    const track = document.getElementById('carouselTrack');
    const indicators = document.getElementById('carouselIndicators');
    track.innerHTML = '';
    indicators.innerHTML = '';

    images.forEach((image, index) => {
        // Create carousel slide
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        if (index === 0) slide.classList.add('active');
        
        // Create loading spinner
        const spinner = document.createElement('div');
        spinner.className = 'image-spinner';
        spinner.innerHTML = '<div class="spinner"></div>';
        
        // Create image element
        const img = document.createElement('img');
        img.alt = `Kegiatan OSIS ${index + 1}`;
        img.src = image.thumbnailUrl;
        
        // Handle image load
        img.onload = () => {
            spinner.style.display = 'none';
            img.style.opacity = '1';
        };
        
        // Handle image error
        img.onerror = () => {
            spinner.style.display = 'none';
            img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22600%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22800%22 height=%22600%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 text-anchor=%22middle%22 fill=%22%23999%22%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E';
            img.style.opacity = '1';
        };
        
        slide.appendChild(spinner);
        slide.appendChild(img);
        slide.onclick = () => openLightbox(index);
        track.appendChild(slide);
    });
    
    // Create pagination indicators with smart pagination
    createPaginationDots(images.length, 0, indicators);
    
    // Preload all images
    preloadImages(images);
}

// Create pagination dots with ellipsis for many pages
function createPaginationDots(totalPages, currentPage, container) {
    container.innerHTML = '';
    
    const maxVisibleDots = 10; // Total dots to show including ellipsis
    
    const firstBtn = document.createElement('button');
    firstBtn.className = 'carousel-dot carousel-nav-btn';
    firstBtn.innerHTML = '«';
    firstBtn.onclick = () => goToSlide(0);
    firstBtn.setAttribute('aria-label', 'First slide');
    firstBtn.disabled = currentPage === 0;
    container.appendChild(firstBtn);
    
    if (totalPages <= maxVisibleDots) {
        // Show all page numbers if we have few pages
        for (let i = 0; i < totalPages; i++) {
            container.appendChild(createDot(i, currentPage));
        }
    } else {
        // Smart pagination with ellipsis
        const dots = [];
        
        // Always show first page
        dots.push(0);
        
        if (currentPage <= 2) {
            dots.push(1, 2, 3, 4);
            dots.push('ellipsis');
            dots.push(totalPages - 1);
        } else if (currentPage >= totalPages - 3) {
            dots.push('ellipsis');
            dots.push(totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
        } else {
            dots.push('ellipsis');
            dots.push(currentPage - 1, currentPage, currentPage + 1);
            dots.push('ellipsis');
            dots.push(totalPages - 1);
        }
        
        // Create dots
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

// Create a single pagination dot
function createDot(index, currentPage) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.textContent = index + 1;
    if (index === currentPage) dot.classList.add('active');
    dot.onclick = () => goToSlide(index);
    dot.setAttribute('aria-label', `Slide ${index + 1}`);
    return dot;
}

// Preload all images
function preloadImages(images) {
    images.forEach((image) => {
        const img = new Image();
        img.src = image.thumbnailUrl;
    });
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.getElementById('carouselIndicators');
    
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    slides.forEach(slide => slide.classList.remove('active'));
    
    slides[index].classList.add('active');
    
    currentImageIndex = index;
    
    // Create pagination dots 
    createPaginationDots(slides.length, index, indicators);
}

function nextSlide() {
    goToSlide(currentImageIndex + 1);
}

function prevSlide() {
    goToSlide(currentImageIndex - 1);
}

// Show error message
function showError(message) {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const carouselContainer = document.getElementById('carouselContainer');
    
    loading.style.display = 'none';
    carouselContainer.style.display = 'none';
    error.style.display = 'flex';
    error.querySelector('p').textContent = message;
}

// Lightbox functionality
function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    
    const image = currentImages[currentImageIndex];
    
    // Show loading state
    lightboxImage.style.opacity = '0';
    lightboxImage.src = '';
    
    // Load the image
    const img = new Image();
    img.onload = () => {
        lightboxImage.src = image.fullUrl;
        lightboxImage.style.opacity = '1';
    };
    img.onerror = () => {
        // Fallback to thumbnail if full image fails
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

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    updateLightboxImage();
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    updateLightboxImage();
}

function updateLightboxImage() {
    const lightboxImage = document.getElementById('lightboxImage');
    const image = currentImages[currentImageIndex];
    
    // Show loading state
    lightboxImage.style.opacity = '0';
    
    // Load the image
    const img = new Image();
    img.onload = () => {
        lightboxImage.src = image.fullUrl;
        lightboxImage.style.opacity = '1';
    };
    img.onerror = () => {
        // Fallback to thumbnail if full image fails
        lightboxImage.src = image.thumbnailUrl;
        lightboxImage.style.opacity = '1';
    };
    img.src = image.fullUrl;
}

// Event listeners
document.getElementById('carouselNext')?.addEventListener('click', nextSlide);
document.getElementById('carouselPrev')?.addEventListener('click', prevSlide);
document.getElementById('closeLightbox')?.addEventListener('click', closeLightbox);
document.getElementById('nextImage')?.addEventListener('click', nextImage);
document.getElementById('prevImage')?.addEventListener('click', prevImage);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox.classList.contains('active')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    }
});

// Close lightbox when clicking outside image
document.getElementById('lightbox')?.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') {
        closeLightbox();
    }
});

// Touch support for mobile swipe
let touchStartX = 0;
let touchEndX = 0;

document.getElementById('carouselContainer')?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.getElementById('carouselContainer')?.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadImages();
});