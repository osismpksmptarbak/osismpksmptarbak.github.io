const track = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentIndex = 0;
let totalCards = 0;

function getCardWidth() {
    const width = window.innerWidth;
    if (width < 480) return 280 + 45;
    if (width < 768) return 300 + 45;
    return 350 + 45;
}

function getVisibleCards() {
    const width = window.innerWidth;
    if (width < 768) return 1;
    if (width < 1024) return 2;
    return 3;
}

function updateCarousel() {
    if (!track) return;
    
    const visibleCards = getVisibleCards();
    const cardWidth = getCardWidth();
    const maxIndex = Math.max(0, totalCards - visibleCards);
    
    currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));
    
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    
    updateButtons(maxIndex);
}

function updateButtons(maxIndex) {
    if (!prevBtn || !nextBtn) return;
    
    const isAtStart = currentIndex === 0;
    const isAtEnd = currentIndex >= maxIndex;
    
    prevBtn.style.opacity = isAtStart ? '0.5' : '1';
    prevBtn.style.cursor = isAtStart ? 'not-allowed' : 'pointer';
    prevBtn.disabled = isAtStart;
    
    nextBtn.style.opacity = isAtEnd ? '0.5' : '1';
    nextBtn.style.cursor = isAtEnd ? 'not-allowed' : 'pointer';
    nextBtn.disabled = isAtEnd;
}

prevBtn?.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
    }
});

nextBtn?.addEventListener('click', () => {
    const visibleCards = getVisibleCards();
    const maxIndex = Math.max(0, totalCards - visibleCards);
    
    if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarousel();
    }
});

window.addEventListener('resize', updateCarousel);

// Public API
window.carouselAPI = {
    updateCarousel,
    setTotalCards: (count) => {
        totalCards = count;
        currentIndex = 0;
        updateCarousel();
    }
};