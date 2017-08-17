const delayInput = document.querySelector("#delayInput");

async function saveOptions() {
  browser.storage.sync.set({
    activeTab: document.querySelector(`input[name="switchTab"]:checked`).value,
    delayOnCreated: delayInput.value
  }).then(null, (error) => {
    console.error(error);
  });
}

async function restoreOptions() {
  let resultA = await browser.storage.sync.get("activeTab");
  let inputA = document.querySelector(`input[name="switchTab"]#${resultA.activeTab}`);
  if (inputA)
    inputA.checked = true;

  let resultD = await browser.storage.sync.get("delayOnCreated");
  delayInput.value = parseInt(resultD.delayOnCreated) || 0;
}

async function doI18n() {
  const getI18nMessage = (strName = "") => {
    const message = browser.i18n.getMessage(strName);
    if (message === "") {
      return strName;
    }
    return message;
  }

  for (let elem of document.querySelectorAll("[i18n-id]")) {
    elem.textContent = getI18nMessage('elem_' + elem.attributes['i18n-id'].value);
  }
}
doI18n();

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelectorAll("input").forEach(() => addEventListener("change", saveOptions));
