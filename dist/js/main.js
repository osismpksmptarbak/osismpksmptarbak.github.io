import { findById } from './utils/dom.js';
// ---- Side menu -----------------------------------------------------------------
const menu = {
    toggle: findById('menuToggle'),
    close: findById('closeMenu'),
    menu: findById('sideMenu'),
    overlay: findById('overlay'),
};
function openMenu() {
    menu.menu?.classList.add('open');
    menu.overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeMenu() {
    menu.menu?.classList.remove('open');
    menu.overlay?.classList.remove('active');
    document.body.style.overflow = 'auto';
}
menu.toggle?.addEventListener('click', openMenu);
menu.close?.addEventListener('click', closeMenu);
menu.overlay?.addEventListener('click', closeMenu);
// Smooth-scroll all in-page anchor links and close the menu afterwards
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        const target = href ? document.querySelector(href) : null;
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMenu();
    });
});
// ---- Accordion -----------------------------------------------------------------
/**
 * Wires up accordion behaviour for every `.accordion-header` element.
 * Clicking a header toggles its own `active` class and its next sibling's.
 * The first header is opened by default.
 *
 * NOTE: Each header is cloned before attaching a listener so that calling
 * this function again (e.g. after dynamic content loads) doesn't stack
 * duplicate listeners.
 */
export function initAccordion() {
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach((header, index) => {
        // Replace with a clone to strip any previously attached listeners
        const clone = header.cloneNode(true);
        header.parentNode?.replaceChild(clone, header);
        clone.addEventListener('click', function () {
            const isActive = this.classList.contains('active');
            this.classList.toggle('active', !isActive);
            this.nextElementSibling?.classList.toggle('active', !isActive);
        });
        // Open the first item on initial render
        if (index === 0) {
            clone.classList.add('active');
            clone.nextElementSibling?.classList.add('active');
        }
    });
}
// ---- Kegiatan OSIS loader ------------------------------------------------------
/**
 * Fetches `kegiatan.txt`, parses its pipe-delimited lines into activities,
 * groups them by year, and renders accordion sections into `#kegiatan-osis`.
 *
 * File format (one activity per line):
 *   YEAR | Title | https://link
 */
async function loadKegiatanOsis() {
    const container = findById('kegiatan-osis');
    if (!container)
        return;
    try {
        const dataUrl = new URL('../../kegiatan-osis/kegiatan.txt', import.meta.url).href;
        const text = await fetch(dataUrl).then(r => r.text());
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
        const grouped = groupByYear(activities);
        container.innerHTML = Object.keys(grouped)
            .sort()
            .map(year => renderYearSection(year, grouped[year] ?? []))
            .join('');
        initAccordion();
    }
    catch (error) {
        console.error('Error loading kegiatan:', error);
        container.innerHTML = `
            <div class="menu-section">
                <p style="padding: 0.5rem; color: var(--text-light);">
                    Tidak ada kegiatan tersedia
                </p>
            </div>`;
    }
}
/** Groups an array of activities into a Record keyed by year. */
function groupByYear(activities) {
    return activities.reduce((acc, activity) => {
        var _a;
        (acc[_a = activity.year] ?? (acc[_a] = [])).push(activity);
        return acc;
    }, {});
}
/** Renders a single accordion section for one year's activities. */
function renderYearSection(year, activities) {
    const items = activities
        .map(a => `<li><a href="${a.link}" target="_blank" rel="noopener noreferrer">${a.title}</a></li>`)
        .join('');
    return `
        <div class="menu-section">
            <p class="accordion-header">Kegiatan OSIS ${year}</p>
            <ul class="accordion-content">${items}</ul>
        </div>`;
}
// ---- Init ----------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initAccordion();
    loadKegiatanOsis();
});
//# sourceMappingURL=main.js.map