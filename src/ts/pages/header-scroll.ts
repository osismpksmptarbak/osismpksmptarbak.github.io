/**
 * Toggles a CSS class on the <header> element based on scroll position.
 *
 * The class `header--transparent` is added while the page is near the top
 * and removed once the user scrolls past SCROLL_THRESHOLD pixels.
 * A requestAnimationFrame guard prevents redundant work during fast scrolling.
 */

const SCROLL_THRESHOLD = 10; // px — small buffer so mobile rubber-band bounces don't flicker

const TRANSPARENT_CLASS = 'header--transparent';

function initHeaderScroll(): void {
    const header = document.querySelector<HTMLElement>('header');
    if (!header) return;

    let ticking = false;

    function applyScrollState(): void {
        const isNearTop = window.scrollY <= SCROLL_THRESHOLD;
        header!.classList.toggle(TRANSPARENT_CLASS, isNearTop);
    }

    function onScroll(): void {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            applyScrollState();
            ticking = false;
        });
    }

    // Set correct state before any scrolling occurs
    applyScrollState();
    window.addEventListener('scroll', onScroll, { passive: true });
}

// Support both deferred and already-ready DOM states
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderScroll);
} else {
    initHeaderScroll();
}

export { initHeaderScroll };