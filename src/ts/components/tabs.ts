import type { TabOptions, TabController } from '../types.js';
import { getUrlParam, setUrlParam } from '../utils/dom.js';

export function initTabs(options: TabOptions): TabController {
    const { tabSelector, panelAttr, paramKey, defaultTab, onChange } = options;

    const tabs = document.querySelectorAll<HTMLElement>(tabSelector);
    const panels = panelAttr
        ? document.querySelectorAll<HTMLElement>(`[${panelAttr}]`)
        : ([] as HTMLElement[]);

    function switchTab(value: string): void {
        tabs.forEach(tab => {
            const tabValue = tab.dataset.org ?? tab.dataset.structure ?? '';
            tab.classList.toggle('active', tabValue === value);
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
        tab.addEventListener('click', () => {
            const value = tab.dataset.org ?? tab.dataset.structure ?? '';
            switchTab(value);
        });
    });

    const paramValue = getUrlParam(paramKey);
    switchTab(paramValue ? paramValue.toUpperCase() : defaultTab);

    return { switchTab };
}