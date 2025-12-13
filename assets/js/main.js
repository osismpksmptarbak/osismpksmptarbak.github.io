// ============================================
// MENU SYSTEM
// ============================================
const menuToggle = document.getElementById('menuToggle');
const closeMenu = document.getElementById('closeMenu');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');

function openMenu() {
    sideMenu.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMenuFunc() {
    sideMenu.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

menuToggle?.addEventListener('click', openMenu);
closeMenu?.addEventListener('click', closeMenuFunc);
overlay?.addEventListener('click', closeMenuFunc);

// ============================================
// SMOOTH SCROLLING
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            closeMenuFunc();
        }
    });
});

// ============================================
// ACCORDION
// ============================================
function initAccordion() {
    const headers = document.querySelectorAll('.accordion-header');
    
    headers.forEach((header, index) => {
        // Remove old listeners by cloning
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
        
        newHeader.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const isActive = this.classList.contains('active');
            
            // Toggle active state
            if (isActive) {
                this.classList.remove('active');
                content.classList.remove('active');
            } else {
                this.classList.add('active');
                content.classList.add('active');
            }
        });
        
        // Open first accordion by default
        if (index === 0) {
            newHeader.classList.add('active');
            newHeader.nextElementSibling.classList.add('active');
        }
    });
}

// ============================================
// KEGIATAN OSIS LOADER
// ============================================
async function loadKegiatanOsis() {
    const container = document.getElementById('kegiatan-osis');
    if (!container) return;
    
    try {
        const response = await fetch('data/kegiatan.txt');
        const text = await response.text();
        const lines = text.trim().split('\n');
        
        const activities = lines
            .map(line => {
                const [year, title, link] = line.split('|');
                return { 
                    year: year?.trim(), 
                    title: title?.trim(), 
                    link: link?.trim() 
                };
            })
            .filter(a => a.year && a.title && a.link);
        
        // Sort by title
        activities.sort((a, b) => a.title.localeCompare(b.title));
        
        // Group by year
        const grouped = activities.reduce((acc, act) => {
            (acc[act.year] = acc[act.year] || []).push(act);
            return acc;
        }, {});
        
        // Render
        const html = Object.keys(grouped).sort().map((year, i) => `
            
                Kegiatan OSIS ${year}
                
                    ${grouped[year].map(a => 
                        `${a.title}`
                    ).join('')}
                
            
        `).join('');
        
        container.innerHTML = html;
        
        // Re-init accordion for dynamically added elements
        initAccordion();
    } catch (error) {
        console.error('Error loading kegiatan:', error);
        container.innerHTML = 'Tidak ada kegiatan tersedia';
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initAccordion();
    loadKegiatanOsis();
});