const structures = {
    OSIS: {
        title: 'STRUKTUR ORGANISASI OSIS',
        logo: 'assets/images/OSIS/osis-logo.png',
        leadership: [
            {
                name: 'Jasmine Azalea A.H.',
                class: 'VIII-BIL2',
                position: 'Ketua Umum',
                image: 'assets/images/OSIS/ketua-osis/8BIL2_Jasmine Azalea A.H._Ketua Umum.png'
            },
            {
                name: 'Kania Dahayu U.',
                class: 'VIII-BIL3',
                position: 'Ketua 1',
                image: 'assets/images/OSIS/ketua-osis/8Bil3_Kania Dahayu U._Ketua 1.jpg'
            },
            {
                name: 'Ferandy Bintang P.P.',
                class: 'VIII-C',
                position: 'Ketua 2',
                image: 'assets/images/OSIS/ketua-osis/8C_Ferandy Bintang P.P_Ketua 2.png'
            }
        ],
        management: [
            {
                name: 'Rachel Ivana N.U.',
                class: 'VIII-BIL1',
                position: 'Sekretaris 1',
                image: 'assets/images/OSIS/bendahara-sekretaris/8BIL1_Rachel Ivana N.U_Sekretaris 1.png'
            },
            {
                name: 'Felcia Kinsey A.G.S.',
                class: 'VII-BIL1',
                position: 'Sekretaris 2',
                image: 'assets/images/OSIS/bendahara-sekretaris/7BIL1_Felcia Kinsey A.G.S._Sekretaris 2.jpg'
            },
            {
                name: 'Dinda Rasya Aulia',
                class: 'VIII-BIL1',
                position: 'Bendahara 1',
                image: 'assets/images/OSIS/bendahara-sekretaris/8BIL1_Dinda Rasya Aulia_Bendahara 1.jpg'
            },
            {
                name: 'Aliyya M. Halim',
                class: 'VII-F',
                position: 'Bendahara 2',
                image: 'assets/images/OSIS/bendahara-sekretaris/7F_Aliyya M. Halim_Bendara 2.png'
            }
        ],
        division: [
            { id: 1, title: 'Keimanan dan Ketaqwaan kepada Tuhan yang Maha esa', link: 'sekbid1.html', logo: 'assets/images/OSIS/sekbid1-logo.png' },
            { id: 2, title: 'Budi Pekerti dan Akhlak Mulia', link: 'sekbid2.html', logo: 'assets/images/OSIS/sekbid2-logo.png' },
            { id: 3, title: 'Kepribadian Unggul, Wawasan Kebangsaan, dan Bela Negara', link: 'sekbid3.html', logo: 'assets/images/OSIS/sekbid3-logo.png' },
            { id: 4, title: 'Prestasi Akademik, Seni, Olahraga, dan Kesehatan Jasmani', link: 'sekbid4.html', logo: 'assets/images/OSIS/sekbid4-logo.png' },
            { id: 5, title: 'Demokrasi, HAM, Pend. Politik', link: 'sekbid5.html', logo: 'assets/images/OSIS/sekbid5-logo.png' },
            { id: 6, title: 'Pembinaan Kreativitas, Keterampilan, dan Kewirausahaan', link: 'sekbid6.html', logo: 'assets/images/OSIS/sekbid6-logo.png' },
            { id: 7, title: 'Sastra Budaya Lokal dan Internasional', link: 'sekbid7.html', logo: 'assets/images/OSIS/sekbid7-logo.png' },
            { id: 8, title: 'Teknologi, Informasi, dan Komunikasi', link: 'sekbid8.html', logo: 'assets/images/OSIS/sekbid8-logo.png' }
        ]
    },
    MPK: {
        title: 'STRUKTUR ORGANISASI MPK',
        logo: 'assets/images/MPK/mpk-logo.png',
        leadership: [
            {
                name: 'Arfa Wardana',
                class: 'VIII-BIL1',
                position: 'Ketua Umum',
                image: 'assets/images/MPK/ketua-mpk/Arfa Wardana - Ketua.png'
            },
            {
                name: 'Inggit Cahaya G.S.',
                class: 'VIII-BIL1',
                position: 'Ketua 1',
                image: 'assets/images/MPK/ketua-mpk/Inggit Cahaya Ganira Suryatmana - Ketua 1.jpg'
            },
            {
                name: 'Rinjani Atreya H.',
                class: 'VIII-C',
                position: 'Ketua 2',
                image: 'assets/images/MPK/ketua-mpk/Rinjani Atreya Hasyim - Ketua 2 MPK.jpg'
            }
        ],
        management: [
            {
                name: 'Abia Jemima',
                class: 'VIII-D',
                position: 'Sekretaris 1',
                image: 'assets/images/MPK/bendahara-sekretaris/Abia Jemima - Sekretaris 1.png'
            },
            {
                name: 'Aranka Hagani W.',
                class: 'VII-E',
                position: 'Sekretaris 2',
                image: 'assets/images/MPK/bendahara-sekretaris/Aranka Hagani Wyman-Sekretaris 2 .jpg'
            },
            {
                name: 'Syabila Maheswari A.',
                class: 'VIII-A',
                position: 'Bendahara 1',
                image: 'assets/images/MPK/bendahara-sekretaris/Syabila Maheswari Anandaku - Bendahara 1.jpg'
            },
            {
                name: 'Wigumvar Adtwija A.',
                class: 'VII-BIL2',
                position: 'Bendahara 2',
                image: 'assets/images/MPK/bendahara-sekretaris/Wigumvar Adtwija Ardiwinangun - Bendahara 2.jpg'
            }
        ],
        division: [
            { id: 'A', title: 'Mengawasi Anggaran Setiap Kegiatan OSIS', link: 'komisia.html', logo: 'assets/images/MPK/komisia-logo.png' },
            { id: 'B', title: 'Mengawasi Akademik Anggota OSIS', link: 'komisib.html', logo: 'assets/images/MPK/komisib-logo.png' },
            { id: 'C', title: 'Mengawasi Sekbid OSIS', link: 'komisic.html', logo: 'assets/images/MPK/komisic-logo.png' },
            { id: 'D', title: 'Hubungan Masyarakat', link: 'komisid.html', logo: 'assets/images/MPK/komisid-logo.png' },
            { id: 'E', title: 'Mengevaluasi Setiap Kegiatan OSIS', link: 'komisie.html', logo: 'assets/images/MPK/komisie-logo.png' }
        ]
    }
};

class Carousel {
    constructor() {
        this.track = document.getElementById('carouselTrack');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentIndex = 0;
        this.totalCards = 0;
        
        this.init();
    }

    init() {
        this.prevBtn?.addEventListener('click', () => this.prev());
        this.nextBtn?.addEventListener('click', () => this.next());
        window.addEventListener('resize', () => this.update());
    }

    getCardWidth() {
        const width = window.innerWidth;
        if (width < 480) return 325;
        if (width < 768) return 345;
        return 395;
    }

    getVisibleCards() {
        const width = window.innerWidth;
        if (width < 768) return 1;
        if (width < 1024) return 2;
        return 3;
    }

    update() {
        if (!this.track) return;
        
        const visibleCards = this.getVisibleCards();
        const cardWidth = this.getCardWidth();
        const maxIndex = Math.max(0, this.totalCards - visibleCards);
        
        this.currentIndex = Math.max(0, Math.min(this.currentIndex, maxIndex));
        this.track.style.transform = `translateX(-${this.currentIndex * cardWidth}px)`;
        this.updateButtons(maxIndex);
    }

    updateButtons(maxIndex) {
        if (!this.prevBtn || !this.nextBtn) return;
        
        const isAtStart = this.currentIndex === 0;
        const isAtEnd = this.currentIndex >= maxIndex;
        
        this.prevBtn.style.opacity = isAtStart ? '0.5' : '1';
        this.prevBtn.style.cursor = isAtStart ? 'not-allowed' : 'pointer';
        this.prevBtn.disabled = isAtStart;
        
        this.nextBtn.style.opacity = isAtEnd ? '0.5' : '1';
        this.nextBtn.style.cursor = isAtEnd ? 'not-allowed' : 'pointer';
        this.nextBtn.disabled = isAtEnd;
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.update();
        }
    }

    next() {
        const maxIndex = Math.max(0, this.totalCards - this.getVisibleCards());
        if (this.currentIndex < maxIndex) {
            this.currentIndex++;
            this.update();
        }
    }

    setTotalCards(count) {
        this.totalCards = count;
        this.currentIndex = 0;
        this.update();
    }
}

const createCard = (person) => `
    <div class="struktur-organisasi-card">
        <div class="struktur-organisasi-card-header">
            <img src="${person.image}" alt="${person.name}">
        </div>
        <div class="struktur-organisasi-card-content">
            <div class="struktur-organisasi-badge">${person.position}</div>
            <h2 class="struktur-organisasi-name">${person.name}</h2>
            <p class="struktur-organisasi-class">${person.class}</p>
        </div>
    </div>
`;

const createSekbidCard = (item, prefix) => `
    <div class="sekbid-card">
        <div class="sekbid-card-image">
            <img src="${item.logo}" alt="${prefix} ${item.id}">
        </div>
        <div class="sekbid-card-content">
            <span class="sekbid-badge">${prefix} ${item.id}</span>
            <h3 class="sekbid-card-title">${item.title}</h3>
            <a href="${item.link}" class="sekbid-btn">Lihat Selengkapnya</a>
        </div>
    </div>
`;

function renderStructure(type) {
    const data = structures[type];
    const container = document.getElementById('strukturContainer');
    const carouselTitle = document.getElementById('carouselTitle');
    const carouselTrack = document.getElementById('carouselTrack');
    const sectionTitle = document.querySelector('.struktur-organisasi-section h1');
    
    if (!container || !carouselTrack) return;
    
    sectionTitle.innerHTML = `
        <img src="${data.logo}" alt="${type} Logo" style="height: 1.5em; vertical-align: middle; margin-right: 0.5em;">
        ${data.title}
    `;
    
    container.innerHTML = `
        <div class="struktur-organisasi-horizontal">
            ${data.leadership.map(createCard).join('')}
        </div>
        <div class="struktur-organisasi-horizontal">
            ${data.management.map(createCard).join('')}
        </div>
    `;
    
    const prefix = type === 'OSIS' ? 'Sekbid' : 'Komisi';
    carouselTitle.textContent = prefix.toUpperCase();
    carouselTrack.innerHTML = data.division.map(item => createSekbidCard(item, prefix)).join('');
    
    window.carousel?.setTotalCards(data.division.length);
}

function toggleStructure(type) {
    renderStructure(type);
    
    const url = new URL(window.location);
    url.searchParams.set('view', type.toLowerCase());
    window.history.pushState({}, '', url);
    
    document.querySelectorAll('.structure-toggle-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.structure === type);
    });
}

function getInitialStructure() {
    const viewParam = new URLSearchParams(window.location.search).get('view');
    const structure = viewParam?.toUpperCase();
    return (structure === 'OSIS' || structure === 'MPK') ? structure : 'OSIS';
}

document.addEventListener('DOMContentLoaded', () => {
    window.carousel = new Carousel();
    
    document.querySelectorAll('.structure-toggle-tab').forEach(tab => {
        tab.addEventListener('click', () => toggleStructure(tab.dataset.structure));
    });
    
    toggleStructure(getInitialStructure());
});