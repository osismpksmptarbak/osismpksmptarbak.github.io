import { getUrlParam, setUrlParam } from '../utils/dom.js';
/**
 * Initialises a tab group: highlights the active tab, shows/hides its panel,
 * persists the selection in the URL, and calls `onChange` on every switch.
 *
 * Each tab element must carry a `data-org` or `data-structure` attribute
 * whose value is the tab's identifier (e.g. `"OSIS"`, `"MPK"`).
 *
 * Returns a controller with `switchTab` and `destroy`. Call `destroy` before
 * calling `initTabs` again on the same elements to prevent stacked listeners.
 */
export function initTabs(options) {
    const { tabSelector, panelAttr, paramKey, defaultTab, onChange } = options;
    const tabs = document.querySelectorAll(tabSelector);
    const panels = panelAttr
        ? document.querySelectorAll(`[${panelAttr}]`)
        : [];
    // AbortController lets us remove all tab listeners in one shot
    const abortController = new AbortController();
    const { signal } = abortController;
    function getTabValue(tab) {
        return tab.dataset.org ?? tab.dataset.structure ?? '';
    }
    function switchTab(value) {
        // Update active state on tab buttons
        tabs.forEach(tab => {
            tab.classList.toggle('active', getTabValue(tab) === value);
        });
        // Show only the matching panel
        if (panelAttr) {
            panels.forEach(panel => {
                const isActive = panel.getAttribute(panelAttr) === value;
                panel.classList.toggle('hidden', !isActive);
            });
        }
        setUrlParam(paramKey, value.toLowerCase());
        onChange?.(value);
    }
    // Wire up click handlers — all removed together via the AbortController
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(getTabValue(tab)), { signal });
    });
    // Restore from URL, or fall back to the default
    const savedValue = getUrlParam(paramKey);
    switchTab(savedValue ? savedValue.toUpperCase() : defaultTab);
    function destroy() {
        abortController.abort();
    }
    return { switchTab, destroy };
}
//# sourceMappingURL=tabs.js.map