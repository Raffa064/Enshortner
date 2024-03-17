const MODE_HASH_FROM_URL = "mode-hash-from-url"; // default
const MODE_ULR_FROM_HASH = "mode-url-from-hash";

const inputValue = getElement("#input-value");
const modeSelector = getElement("#mode-selector");
const actionButton = getElement("#action-button");
const outputContent = getElement("#output-content");
const outputCopy = getElement("#output-copy");

setupElements();

function setupElements() {
  modeSelector.value = MODE_HASH_FROM_URL;
  
  actionButton.onclick = handleModeAction;
}

function handleModeAction() {
  var handler = null;

  switch (modeSelector.value) {
    case MODE_HASH_FROM_URL:
      handler = requestHashFromAPI;
      break;
    case MODE_ULR_FROM_HASH:
      handler = requestURLFromAPI;
      break;
  }

  if (handler) {
    handler(inputValue.value);
    return;
  }

  throw new Error("Invalid action handler");
}

function err(errCode, errMessage, data) {
  return '<span id="error">' +
      '<strong>Error '+errCode+': </strong>' +
      errMessage + '<br>' +
      (data? ('at "'+ data + '"') : "") +
    '</span>';
}

function requestHashFromAPI(url) {
  fetch("/url?u="+url)
    .then((res) => {
      res.json()
        .then(json => {
          if (!res.ok) {
            const { errCode, errMessage, data } = json;
            outputContent.innerHTML = err(errCode, errMessage, data);
            return;
          }

          outputContent.innerText = json.hashURL;
        }).catch((err) => {
            console.log(err);
            outputContent.innerHTML = err(0, "Client side error: Invalid server response");
        });
    })
    .catch((err) => {
      console.log(err);
      outputContent.inneHTML = err(0, "Client side unexpected error");
    });
}

function requestURLFromAPI(hash) {
  fetch("/hash/"+hash+"?noredirect=true")
    .then((res) => {
      res.json()
        .then((json) => {
          if (!res.ok) {
            const { errCode, errMessage, data } = json;
            outputContent.innerHTML = err(errCode, errMessage, data);
            return;
          }

          outputContent.innerText = json.redirectURL;
        })
        .catch((err) => {
          console.log(err);
          outputContent.innerHTML = err(1, "Client side error: Invalid server response");
        });
    }).catch((err) => {
      console.log(err);
      outputContent.innerHTML = err(1, "Client side unexpect error");
    });
}

function getElement(selector) {
  return document.querySelector(selector);
}
