import { getUrlParam, setUrlParam } from '../utils/dom.js';
export function initTabs(options) {
    const { tabSelector, panelAttr, paramKey, defaultTab, onChange } = options;
    const tabs = document.querySelectorAll(tabSelector);
    const panels = panelAttr
        ? document.querySelectorAll(`[${panelAttr}]`)
        : [];
    function switchTab(value) {
        tabs.forEach(tab => {
            const tabValue = tab.dataset.org ?? tab.dataset.structure ?? '';
            tab.classList.toggle('active', tabValue === value);
        });
        if (panelAttr) {
            panels.forEach(panel => {
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
//# sourceMappingURL=tabs.js.map