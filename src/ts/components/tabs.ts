import type { TabOptions, TabController } from '../types.js';
import { getUrlParam, setUrlParam } from '../utils/dom.js';

/**
 * Initialises a tab group: highlights the active tab, shows/hides its panel,
 * persists the selection in the URL, and calls `onChange` on every switch.
 *
 * Each tab element must carry a `data-org` or `data-structure` attribute
 * whose value is the tab's identifier (e.g. `"OSIS"`, `"MPK"`).
 *
 * Returns a controller with `switchTab` and `destroy`.
 * Call `destroy` before calling `initTabs` again on the same elements
 * to prevent stacked listeners.
 */
export function initTabs(options: TabOptions): TabController {
    const { tabSelector, panelAttr, paramKey, defaultTab, onChange } = options;

    const tabs   = document.querySelectorAll<HTMLElement>(tabSelector);
    const panels = panelAttr
        ? document.querySelectorAll<HTMLElement>(`[${panelAttr}]`)
        : [];

    // One AbortController lets us remove all tab listeners in a single call
    const tabListeners = new AbortController();

    function getTabValue(tab: HTMLElement): string {
        return tab.dataset.org ?? tab.dataset.structure ?? '';
    }

    function switchTab(value: string): void {
        tabs.forEach(tab => {
            tab.classList.toggle('active', getTabValue(tab) === value);
        });

        if (panelAttr) {
            (panels as NodeListOf<HTMLElement>).forEach(panel => {
                panel.classList.toggle('hidden', panel.getAttribute(panelAttr) !== value);
            });
        }

        setUrlParam(paramKey, value.toLowerCase());
        onChange?.(value);
    }

    tabs.forEach(tab => {
        tab.addEventListener(
            'click',
            () => switchTab(getTabValue(tab)),
            { signal: tabListeners.signal },
        );
    });

    // Restore from URL, or fall back to the default tab
    const savedValue = getUrlParam(paramKey);
    switchTab(savedValue ? savedValue.toUpperCase() : defaultTab);

    return {
        switchTab,
        destroy: () => tabListeners.abort(),
    };
}