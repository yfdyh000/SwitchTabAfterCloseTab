let currentWindowTabs;

async function rememberTabs() {
    currentWindowTabs = await browser.tabs.query({ currentWindow: true });
    return currentWindowTabs;
}

async function tabRemoved(tabId, removeInfo) {
    if (removeInfo.isWindowClosing) return;

    let arrayIndex = currentWindowTabs.findIndex(t => (t.id === tabId)); // oldTab
    let newActiveTabId = currentWindowTabs[(arrayIndex > 0) ? arrayIndex - 1 : arrayIndex].id;
    await browser.tabs.update(newActiveTabId, { active: true });
    rememberTabs();
}

rememberTabs();

browser.windows.onFocusChanged.addListener(rememberTabs);
browser.windows.onRemoved.addListener(rememberTabs);
browser.tabs.onActivated.addListener(rememberTabs);
browser.tabs.onCreated.addListener(rememberTabs);
browser.tabs.onRemoved.addListener(tabRemoved);
