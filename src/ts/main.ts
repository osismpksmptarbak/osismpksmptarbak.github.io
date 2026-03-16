import type { MenuElements, KegiatanActivity } from './types.js';
import { findById } from './utils/dom.js';

// ---- Side menu -----------------------------------------------------------------

const menuElements: MenuElements = {
    toggle:  findById('menuToggle'),
    close:   findById('closeMenu'),
    menu:    findById('sideMenu'),
    overlay: findById('overlay'),
};

function openMenu(): void {
    menuElements.menu?.classList.add('open');
    menuElements.overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMenu(): void {
    menuElements.menu?.classList.remove('open');
    menuElements.overlay?.classList.remove('active');
    document.body.style.overflow = 'auto';
}

menuElements.toggle?.addEventListener('click', openMenu);
menuElements.close?.addEventListener('click', closeMenu);
menuElements.overlay?.addEventListener('click', closeMenu);

document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (!href) return;
        const target = document.querySelector<HTMLElement>(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            closeMenu();
        }
    });
});

// ---- Accordion -----------------------------------------------------------------

export function initAccordion(): void {
    const headers = document.querySelectorAll<HTMLElement>('.accordion-header');

    headers.forEach((header, index) => {
        const fresh = header.cloneNode(true) as HTMLElement;
        header.parentNode?.replaceChild(fresh, header);

        fresh.addEventListener('click', function (this: HTMLElement) {
            const content = this.nextElementSibling as HTMLElement | null;
            const isActive = this.classList.contains('active');
            this.classList.toggle('active', !isActive);
            content?.classList.toggle('active', !isActive);
        });

        if (index === 0) {
            fresh.classList.add('active');
            (fresh.nextElementSibling as HTMLElement | null)?.classList.add('active');
        }
    });
}

// ---- Kegiatan OSIS loader ------------------------------------------------------

async function loadKegiatanOsis(): Promise<void> {
    const container = findById('kegiatan-osis');
    if (!container) return;

    try {
        const dataUrl = new URL('../../kegiatan-osis/kegiatan.txt', import.meta.url).href;
        const response = await fetch(dataUrl);
        const text = await response.text();

        const activities: KegiatanActivity[] = text
            .trim()
            .split('\n')
            .map(line => {
                const [year, title, link] = line.split('|');
                return {
                    year:  year?.trim()  ?? '',
                    title: title?.trim() ?? '',
                    link:  link?.trim()  ?? '',
                };
            })
            .filter((a): a is KegiatanActivity => Boolean(a.year && a.title && a.link))
            .sort((a, b) => a.title.localeCompare(b.title));

        const grouped = activities.reduce<Record<string, KegiatanActivity[]>>((acc, act) => {
            (acc[act.year] ??= []).push(act);
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
    } catch (error) {
        console.error('Error loading kegiatan:', error);
        container.innerHTML = '<div class="menu-section"><p style="padding: 0.5rem; color: var(--text-light);">Tidak ada kegiatan tersedia</p></div>';
    }
}

// ---- Init ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    initAccordion();
    loadKegiatanOsis();
});