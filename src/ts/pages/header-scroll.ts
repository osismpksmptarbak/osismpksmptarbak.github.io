const SCROLL_THRESHOLD = 10; // px – wiggle-room so a 1 px rubber-band bounce
                              // on mobile doesn't flash the opaque state
const TRANSPARENT_CLASS = 'header--transparent';

function initHeaderScroll(): void {
    const header = document.querySelector<HTMLElement>('header');
    if (!header) return;

    let ticking = false;

    function applyState(): void {
        const atTop = window.scrollY <= SCROLL_THRESHOLD;
        header!.classList.toggle(TRANSPARENT_CLASS, atTop);
    }

    function onScroll(): void {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            applyState();
            ticking = false;
        });
    }

    applyState();

    window.addEventListener('scroll', onScroll, { passive: true });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderScroll);
} else {
    initHeaderScroll();
}

export { initHeaderScroll };