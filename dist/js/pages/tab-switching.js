import { initTabs } from '../components/tabs.js';
import { StructureCarousel } from '../components/carousel.js';
import { findById, getUrlParam } from '../utils/dom.js';
document.addEventListener('DOMContentLoaded', () => {
    const isStructurePage = !!document.getElementById('osis-content');
    if (isStructurePage) {
        initStructurePage();
    }
    else {
        initBerandaPage();
    }
});
// ---- Struktur Organisasi page --------------------------------------------------
function initStructurePage() {
    const carousel = new StructureCarousel();
    const initialIndex = parseInt(getUrlParam('index') ?? '0') || 0;
    let isFirstLoad = true;
    initTabs({
        tabSelector: '.structure-toggle-tab',
        panelAttr: null,
        paramKey: 'view',
        defaultTab: 'OSIS',
        onChange(type) {
            const isOSIS = type === 'OSIS';
            findById('osis-content')?.classList.toggle('hidden', !isOSIS);
            findById('mpk-content')?.classList.toggle('hidden', isOSIS);
            const osisTrack = findById('osis-carousel-track');
            const mpkTrack = findById('mpk-carousel-track');
            osisTrack?.classList.toggle('hidden', !isOSIS);
            mpkTrack?.classList.toggle('hidden', isOSIS);
            const sectionLogo = findById('sectionLogo');
            if (sectionLogo) {
                sectionLogo.src = isOSIS
                    ? 'public/images/struktur-organisasi/OSIS/osis-logo.png'
                    : 'public/images/struktur-organisasi/MPK/mpk-logo.png';
            }
            const carouselTitle = findById('carouselTitle');
            if (carouselTitle) {
                carouselTitle.textContent = isOSIS ? '- SEKBID -' : '- KOMISI -';
            }
            const activeTrack = isOSIS ? osisTrack : mpkTrack;
            if (activeTrack) {
                carousel.setTrack(activeTrack, isFirstLoad ? initialIndex : 0);
            }
            isFirstLoad = false;
        },
    });
}
// ---- Beranda page --------------------------------------------------------------
function initBerandaPage() {
    initTabs({
        tabSelector: '.beranda-toggle-tab',
        panelAttr: 'data-org-panel',
        paramKey: 'org',
        defaultTab: 'OSIS',
    });
}
//# sourceMappingURL=tab-switching.js.map