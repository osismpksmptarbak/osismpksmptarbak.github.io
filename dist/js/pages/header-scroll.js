/**
 * Toggles `header--transparent` on the <header> element based on scroll position.
 *
 * The class is present while the page is near the top and removed once the
 * user scrolls past SCROLL_THRESHOLD pixels. A requestAnimationFrame guard
 * prevents redundant DOM writes during fast scrolling.
 */
const SCROLL_THRESHOLD = 10; // px — small buffer to avoid flicker on mobile rubber-band bounces
const TRANSPARENT_CLASS = 'header--transparent';
function initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header)
        return;
    let scheduled = false;
    function applyScrollState() {
        header.classList.toggle(TRANSPARENT_CLASS, window.scrollY <= SCROLL_THRESHOLD);
    }
    function onScroll() {
        if (scheduled)
            return;
        scheduled = true;
        requestAnimationFrame(() => {
            applyScrollState();
            scheduled = false;
        });
    }
    applyScrollState(); // Apply correct class before any scrolling occurs
    window.addEventListener('scroll', onScroll, { passive: true });
}
// Handle both deferred and already-ready DOM states
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderScroll);
}
else {
    initHeaderScroll();
}
export { initHeaderScroll };
//# sourceMappingURL=header-scroll.js.map