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
    // Track whether this is the first tab switch so we can restore the saved index
    let isFirstSwitch = true;
    initTabs({
        tabSelector: '.beranda-toggle-tab',
        panelAttr: 'data-org-panel',
        paramKey: 'org',
        defaultTab: 'OSIS',
        onChange: (type) => handleTabChange(type, carousel, initialIndex, isFirstSwitch),
    });
    // After initTabs fires its first onChange, subsequent ones are no longer "first"
    isFirstSwitch = false;
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
    // Update text that names the active organisation
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