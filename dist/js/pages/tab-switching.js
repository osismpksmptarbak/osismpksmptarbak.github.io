import { initTabs } from '../components/tabs.js';
import { StructureCarousel } from '../components/carousel.js';
import { findById, getUrlParam } from '../utils/dom.js';
document.addEventListener('DOMContentLoaded', initBerandaPage);
// ---- Page init -----------------------------------------------------------------
function initBerandaPage() {
    const hasStruktur = !!document.getElementById('osis-content');
    const initialIndex = parseInt(getUrlParam('index') ?? '0') || 0;
    // The carousel is only created when the structure section is present
    const carousel = hasStruktur ? new StructureCarousel() : null;
    // `isFirstSwitch` must be captured *inside* the closure so that it reflects
    // state at the time onChange fires, not at the time initTabs returns.
    // initTabs fires onChange synchronously during initialisation, so setting
    // the flag to false *after* calling initTabs would be too late.
    let isFirstSwitch = true;
    initTabs({
        tabSelector: '.beranda-toggle-tab',
        panelAttr: 'data-org-panel',
        paramKey: 'org',
        defaultTab: 'OSIS',
        onChange: (type) => {
            handleTabChange(type, carousel, initialIndex, isFirstSwitch);
            // Mark the first switch as handled only after onChange has run
            isFirstSwitch = false;
        },
    });
}
// ---- Tab change handler --------------------------------------------------------
/**
 * Responds to OSIS / MPK tab changes:
 * - Toggles content visibility
 * - Updates copy that references the active organisation
 * - Hands the correct carousel track to the StructureCarousel instance
 */
function handleTabChange(type, carousel, initialIndex, isFirstSwitch) {
    const isOSIS = type === 'OSIS';
    // Show/hide main content sections
    findById('osis-content')?.classList.toggle('hidden', !isOSIS);
    findById('mpk-content')?.classList.toggle('hidden', isOSIS);
    // Show/hide carousel tracks
    const osisTrack = findById('osis-carousel-track');
    const mpkTrack = findById('mpk-carousel-track');
    osisTrack?.classList.toggle('hidden', !isOSIS);
    mpkTrack?.classList.toggle('hidden', isOSIS);
    // Apply MPK colour theme — body covers shared elements (blobs, toggle tabs,
    // banner h1, nav accents); mpk-content panel scopes section-level elements
    document.body.classList.toggle('theme-mpk', !isOSIS);
    const mpkContent = findById('mpk-content');
    if (mpkContent) {
        mpkContent.classList.toggle('theme-mpk', !isOSIS);
    }
    const prokerDescription = findById('proker-description');
    if (prokerDescription) {
        prokerDescription.textContent = isOSIS
            ? 'Berikut adalah beberapa program kerja unggulan OSIS SMP Taruna Bakti'
            : 'Berikut adalah beberapa program kerja unggulan MPK SMP Taruna Bakti';
    }
    const carouselTitle = findById('carouselTitle');
    if (carouselTitle) {
        carouselTitle.textContent = isOSIS ? 'SEKBID' : 'KOMISI';
    }
    // Point the carousel at the newly visible track
    const activeTrack = isOSIS ? osisTrack : mpkTrack;
    if (activeTrack && carousel) {
        // On first load, restore the index from the URL; otherwise reset to 0
        carousel.setTrack(activeTrack, isFirstSwitch ? initialIndex : 0);
    }
}
//# sourceMappingURL=tab-switching.js.map