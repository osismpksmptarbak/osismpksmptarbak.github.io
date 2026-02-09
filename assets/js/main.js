const menuElements = {
    toggle: document.getElementById('menuToggle'),
    close: document.getElementById('closeMenu'),
    menu: document.getElementById('sideMenu'),
    overlay: document.getElementById('overlay')
};

function openMenu() {
    menuElements.menu.classList.add('open');
    menuElements.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    menuElements.menu.classList.remove('open');
    menuElements.overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

menuElements.toggle?.addEventListener('click', openMenu);
menuElements.close?.addEventListener('click', closeMenu);
menuElements.overlay?.addEventListener('click', closeMenu);

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            closeMenu();
        }
    });
});

function initAccordion() {
    const headers = document.querySelectorAll('.accordion-header');
    
    headers.forEach((header, index) => {
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
        
        newHeader.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const isActive = this.classList.contains('active');
            
            this.classList.toggle('active', !isActive);
            content.classList.toggle('active', !isActive);
        });
        
        if (index === 0) {
            newHeader.classList.add('active');
            newHeader.nextElementSibling.classList.add('active');
        }
    });
}

async function loadKegiatanOsis() {
    const container = document.getElementById('kegiatan-osis');
    if (!container) return;
    
    try {
        const dataUrl = new URL('../../data/kegiatan.txt', import.meta.url).href;
        const response = await fetch(dataUrl);
        const text = await response.text();
        
        const activities = text.trim()
            .split('\n')
            .map(line => {
                const [year, title, link] = line.split('|');
                return { 
                    year: year?.trim(), 
                    title: title?.trim(), 
                    link: link?.trim() 
                };
            })
            .filter(a => a.year && a.title && a.link)
            .sort((a, b) => a.title.localeCompare(b.title));
        
        const grouped = activities.reduce((acc, act) => {
            (acc[act.year] = acc[act.year] || []).push(act);
            return acc;
        }, {});
        
        const html = Object.keys(grouped)
            .sort()
            .map(year => `
                <div class="menu-section">
                    <h3 class="accordion-header">Kegiatan OSIS ${year}</h3>
                    <ul class="accordion-content">
                        ${grouped[year].map(a => 
                            `<li><a href="${a.link}" target="_blank" rel="noopener noreferrer">${a.title}</a></li>`
                        ).join('')}
                    </ul>
                </div>
            `).join('');
        
        container.innerHTML = html;
        initAccordion();
    } catch (error) {
        console.error('Error loading kegiatan:', error);
        container.innerHTML = '<div class="menu-section"><p style="padding: 0.5rem; color: var(--text-light);">Tidak ada kegiatan tersedia</p></div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAccordion();
    loadKegiatanOsis();
});