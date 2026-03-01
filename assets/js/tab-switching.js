function initTabs({ tabSelector, panelAttr, paramKey, defaultTab, onChange }) {
    const tabs = document.querySelectorAll(tabSelector);
    const panels = panelAttr ? document.querySelectorAll(`[${panelAttr}]`) : [];

    function switchTab(value) {
        tabs.forEach(t => {
            t.classList.toggle('active', (t.dataset.org || t.dataset.structure) === value);
        });

        panels.forEach(p => {
            p.classList.toggle('hidden', p.getAttribute(panelAttr) !== value);
        });

        const url = new URL(window.location);
        url.searchParams.set(paramKey, value.toLowerCase());
        window.history.replaceState({}, '', url);

        if (onChange) onChange(value);
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.org || tab.dataset.structure));
    });

    const paramValue = new URLSearchParams(window.location.search).get(paramKey);
    switchTab(paramValue ? paramValue.toUpperCase() : defaultTab);

    return { switchTab };
}

document.addEventListener('DOMContentLoaded', () => {
    const isStructurePage = !!document.getElementById('osis-content');

    if (isStructurePage) {
        window.carousel = new Carousel();

        const params = new URLSearchParams(window.location.search);
        const initialIndex = parseInt(params.get('index')) || 0;
        let isFirstLoad = true;

        initTabs({
            tabSelector: '.structure-toggle-tab',
            panelAttr: null,
            paramKey: 'view',
            defaultTab: 'OSIS',
            onChange(type) {
                const isOSIS = type === 'OSIS';

                document.getElementById('osis-content').classList.toggle('hidden', !isOSIS);
                document.getElementById('mpk-content').classList.toggle('hidden', isOSIS);

                const osisTrack = document.getElementById('osis-carousel-track');
                const mpkTrack = document.getElementById('mpk-carousel-track');
                osisTrack.classList.toggle('hidden', !isOSIS);
                mpkTrack.classList.toggle('hidden', isOSIS);

                document.getElementById('sectionLogo').src = isOSIS
                    ? 'assets/images/OSIS/osis-logo.png'
                    : 'assets/images/MPK/mpk-logo.png';
                document.getElementById('sectionTitle').childNodes[2].textContent = isOSIS
                    ? ' STRUKTUR ORGANISASI OSIS'
                    : ' STRUKTUR ORGANISASI MPK';
                document.getElementById('carouselTitle').textContent = isOSIS ? '- SEKBID -' : '- KOMISI -';

                window.carousel.setTrack(isOSIS ? osisTrack : mpkTrack, isFirstLoad ? initialIndex : 0);
                isFirstLoad = false;
            }
        });
    } else {
        initTabs({
            tabSelector: '.beranda-toggle-tab',
            panelAttr: 'data-org-panel',
            paramKey: 'org',
            defaultTab: 'OSIS'
        });
    }
});