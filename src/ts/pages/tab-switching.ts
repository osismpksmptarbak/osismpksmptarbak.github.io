import { initTabs } from '../components/tabs.js';
import { StructureCarousel } from '../components/carousel.js';
import { findById, getUrlParam } from '../utils/dom.js';

document.addEventListener('DOMContentLoaded', () => {
    initBerandaPage();
});

function initBerandaPage(): void {
    const hasStruktur = !!document.getElementById('osis-content');
    let carousel: StructureCarousel | null = null;
    let isFirstLoad = true;

    if (hasStruktur) {
        carousel = new StructureCarousel();
    }

    const initialIndex = parseInt(getUrlParam('index') ?? '0') || 0;

    initTabs({
        tabSelector: '.beranda-toggle-tab',
        panelAttr:   'data-org-panel',
        paramKey:    'org',
        defaultTab:  'OSIS',

        onChange(type: string): void {
            if (!hasStruktur) return;

            const isOSIS = type === 'OSIS';

            findById('osis-content')?.classList.toggle('hidden', !isOSIS);
            findById('mpk-content')?.classList.toggle('hidden',  isOSIS);

            const osisTrack = findById('osis-carousel-track');
            const mpkTrack  = findById('mpk-carousel-track');
            osisTrack?.classList.toggle('hidden', !isOSIS);
            mpkTrack?.classList.toggle('hidden',   isOSIS);

            const prokerDescription = findById('proker-description');
            if (prokerDescription) {
                prokerDescription.textContent = isOSIS
                    ? 'Berikut adalah beberapa program kerja unggulan OSIS SMP Taruna Bakti'
                    : 'Berikut adalah beberapa program kerja unggulan MPK SMP Taruna Bakti';
            }

            const carouselTitle = findById('carouselTitle');
            if (carouselTitle) {
                carouselTitle.textContent = isOSIS ? '- SEKBID -' : '- KOMISI -';
            }

            const activeTrack = isOSIS ? osisTrack : mpkTrack;
            if (activeTrack && carousel) {
                carousel.setTrack(activeTrack, isFirstLoad ? initialIndex : 0);
            }

            isFirstLoad = false;
        },
    });
}