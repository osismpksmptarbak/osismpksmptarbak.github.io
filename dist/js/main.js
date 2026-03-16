import { findById } from './utils/dom.js';
// ---- Side menu -----------------------------------------------------------------
const menuElements = {
    toggle: findById('menuToggle'),
    close: findById('closeMenu'),
    menu: findById('sideMenu'),
    overlay: findById('overlay'),
};
function openMenu() {
    menuElements.menu?.classList.add('open');
    menuElements.overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeMenu() {
    menuElements.menu?.classList.remove('open');
    menuElements.overlay?.classList.remove('active');
    document.body.style.overflow = 'auto';
}
menuElements.toggle?.addEventListener('click', openMenu);
menuElements.close?.addEventListener('click', closeMenu);
menuElements.overlay?.addEventListener('click', closeMenu);
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (!href)
            return;
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            closeMenu();
        }
    });
});
// ---- Accordion -----------------------------------------------------------------
export function initAccordion() {
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach((header, index) => {
        const fresh = header.cloneNode(true);
        header.parentNode?.replaceChild(fresh, header);
        fresh.addEventListener('click', function () {
            const content = this.nextElementSibling;
            const isActive = this.classList.contains('active');
            this.classList.toggle('active', !isActive);
            content?.classList.toggle('active', !isActive);
        });
        if (index === 0) {
            fresh.classList.add('active');
            fresh.nextElementSibling?.classList.add('active');
        }
    });
}
// ---- Kegiatan OSIS loader ------------------------------------------------------
async function loadKegiatanOsis() {
    const container = findById('kegiatan-osis');
    if (!container)
        return;
    try {
        const dataUrl = new URL('../../kegiatan-osis/kegiatan.txt', import.meta.url).href;
        const response = await fetch(dataUrl);
        const text = await response.text();
        const activities = text
            .trim()
            .split('\n')
            .map(line => {
            const [year, title, link] = line.split('|');
            return {
                year: year?.trim() ?? '',
                title: title?.trim() ?? '',
                link: link?.trim() ?? '',
            };
        })
            .filter((a) => Boolean(a.year && a.title && a.link))
            .sort((a, b) => a.title.localeCompare(b.title));
        const grouped = activities.reduce((acc, act) => {
            var _a;
            (acc[_a = act.year] ?? (acc[_a] = [])).push(act);
            return acc;
        }, {});
        container.innerHTML = Object.keys(grouped)
            .sort()
            .map(year => `
                <div class="menu-section">
                    <p class="accordion-header">Kegiatan OSIS ${year}</p>
                    <ul class="accordion-content">
                        ${(grouped[year] ?? [])
            .map(a => `<li><a href="${a.link}" target="_blank" rel="noopener noreferrer">${a.title}</a></li>`)
            .join('')}
                    </ul>
                </div>
            `)
            .join('');
        initAccordion();
    }
    catch (error) {
        console.error('Error loading kegiatan:', error);
        container.innerHTML = '<div class="menu-section"><p style="padding: 0.5rem; color: var(--text-light);">Tidak ada kegiatan tersedia</p></div>';
    }
}
// ---- Init ----------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initAccordion();
    loadKegiatanOsis();
});
//# sourceMappingURL=main.js.map