let currentWindowTabs;
let delayOnCreated = 0;

async function rememberTabs() {
    currentWindowTabs = await browser.tabs.query({ currentWindow: true });
    return currentWindowTabs;
}

async function delay_rememberTabs() {
    setTimeout(function () {
        rememberTabs();
    }, delayOnCreated); // compatible with other add-ons, like "Open Tabs Next to Current"
}

async function tabRemoved(tabId, removeInfo) {
    if (removeInfo.isWindowClosing) return;

    let arrayIndex = currentWindowTabs.findIndex(t => (t.id === tabId)); // oldTab
    let newActiveTabId = currentWindowTabs[(arrayIndex > 0) ? arrayIndex - 1 : arrayIndex].id;
    await browser.tabs.update(newActiveTabId, { active: true });
    rememberTabs();
}

async function detectConflictAddons() {
    browser.management.get("opentabsnexttocurrent@sblask").then((ExtensionInfo) => {
        if (!ExtensionInfo.enabled) return;
        console.warn(`"Open Tabs Next to Current" is enabled, attempt delay to avoid conflicts.`)
        delayOnCreated = 500; // TODO: Any more reliable ways? Or make it customizable is needed?
    });
}

rememberTabs();
detectConflictAddons();

browser.windows.onFocusChanged.addListener(rememberTabs);
browser.windows.onRemoved.addListener(rememberTabs);
browser.tabs.onActivated.addListener(rememberTabs);
browser.tabs.onCreated.addListener(delay_rememberTabs);
browser.tabs.onRemoved.addListener(tabRemoved);
browser.management.onEnabled.addListener(detectConflictAddons);
