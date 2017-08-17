let windowTabs;
let delayOnCreated = 0;
let activeTabChoose;

async function rememberTabs() {
    windowTabs = await browser.tabs.query({ currentWindow: true });
    return windowTabs;
}

async function delay_rememberTabs() {
    setTimeout(function () {
        rememberTabs();
    }, delayOnCreated); // compatible with other add-ons, like "Open Tabs Next to Current"
}

async function tabRemoved(tabId, removeInfo) {
    if (removeInfo.isWindowClosing) return;

    let arrayIndex = windowTabs.findIndex(t => (t.id === tabId)); // oldTab
    let newIndex = (arrayIndex > 0) ? arrayIndex - 1 : arrayIndex; // default: last; TODO: The future should be opened or default behavior.
    console.log(`activeTabChoose is ${activeTabChoose}`);
    switch (activeTabChoose) {
        case "first":
            newIndex = 0;
            break;
        case "last": // previous
            break;
        case "next":
            newIndex = (arrayIndex < windowTabs.length) ? arrayIndex + 1 : arrayIndex;
            break;
        case "end":
            newIndex = windowTabs.length - 1;
            break;
        default:
            break;
    }
    let newActiveTabId = windowTabs[newIndex].id;
    await browser.tabs.update(newActiveTabId, { active: true });
    rememberTabs();
}

async function detectConflictAddons() {
    browser.management.get("opentabsnexttocurrent@sblask").then((ExtensionInfo) => {
        if (!ExtensionInfo.enabled) return;
        console.warn(`"Open Tabs Next to Current" is enabled, attempt delay 500ms to avoid conflicts.`)
        if (delayOnCreated < 500)
          delayOnCreated = 500; // TODO: Any more reliable ways?
    });
}

async function init() {
    activeTabChoose = (await browser.storage.sync.get("activeTab")).activeTab;
    rememberTabs();
    detectConflictAddons();
}
init();

browser.windows.onFocusChanged.addListener(rememberTabs);
browser.windows.onRemoved.addListener(rememberTabs);
browser.tabs.onActivated.addListener(rememberTabs);
browser.tabs.onCreated.addListener(delay_rememberTabs);
browser.tabs.onRemoved.addListener(tabRemoved);
browser.management.onEnabled.addListener(detectConflictAddons);

async function storageChange(c) {
    if (c.activeTab) {
        activeTabChoose = c.activeTab.newValue;
    }
    if (c.delayOnCreated) {
        delayOnCreated = parseInt(c.delayOnCreated.newValue);
    }
}
browser.storage.onChanged.addListener(storageChange);
