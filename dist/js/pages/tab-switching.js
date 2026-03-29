import { initTabs } from '../components/tabs.js';
import { StructureCarousel } from '../components/carousel.js';
import { findById, getUrlParam } from '../utils/dom.js';
document.addEventListener('DOMContentLoaded', initBerandaPage);
// ---- Page init -----------------------------------------------------------------
function initBerandaPage() {
    const hasStruktur = !!document.getElementById('osis-content');
    const initialIndex = parseInt(getUrlParam('index') ?? '0') || 0;
    // The carousel is only mounted when the structure section exists
    const carousel = hasStruktur ? new StructureCarousel() : null;
    // `isFirstSwitch` must be declared before calling `initTabs`, because
    // initTabs fires `onChange` synchronously during initialisation —
    // setting the flag to false *after* would miss that first call.
    let isFirstSwitch = true;
    initTabs({
        tabSelector: '.beranda-toggle-tab',
        panelAttr: 'data-org-panel',
        paramKey: 'org',
        defaultTab: 'OSIS',
        onChange(type) {
            handleTabChange(type, carousel, initialIndex, isFirstSwitch);
            isFirstSwitch = false;
        },
    });
}
// ---- Tab change handler --------------------------------------------------------
/**
 * Responds to OSIS / MPK tab changes:
 * - Toggles the visibility of content sections and carousel tracks
 * - Applies the MPK colour theme when appropriate
 * - Updates labels that reference the active organisation
 * - Hands the correct carousel track to the StructureCarousel instance
 */
function handleTabChange(type, carousel, initialIndex, isFirstSwitch) {
    const isOSIS = type === 'OSIS';
    // Content sections
    findById('osis-content')?.classList.toggle('hidden', !isOSIS);
    findById('mpk-content')?.classList.toggle('hidden', isOSIS);
    // Carousel tracks
    const osisTrack = findById('osis-carousel-track');
    const mpkTrack = findById('mpk-carousel-track');
    osisTrack?.classList.toggle('hidden', !isOSIS);
    mpkTrack?.classList.toggle('hidden', isOSIS);
    // MPK colour theme — body covers shared elements (blobs, toggle tabs, nav
    // accents); mpk-content scopes section-level elements
    document.body.classList.toggle('theme-mpk', !isOSIS);
    findById('mpk-content')?.classList.toggle('theme-mpk', !isOSIS);
    // Dynamic copy
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
    // Point the carousel at the newly visible track.
    // On first load, restore the index from the URL; otherwise reset to 0.
    const activeTrack = isOSIS ? osisTrack : mpkTrack;
    if (activeTrack && carousel) {
        carousel.setTrack(activeTrack, isFirstSwitch ? initialIndex : 0);
    }
}
//# sourceMappingURL=tab-switching.js.map