var coiReloadFlag = "coiReloadedByServiceWorker";

if ("serviceWorker" in navigator && "crossOriginIsolated" in window && !window.crossOriginIsolated) {
  navigator.serviceWorker.register("/coi-serviceworker.js").then(function () {
    return navigator.serviceWorker.ready;
  }).then(function () {
    if (!window.crossOriginIsolated) {
      if (!window.sessionStorage.getItem(coiReloadFlag)) {
        window.sessionStorage.setItem(coiReloadFlag, "true");
        window.location.reload();
      }
    } else {
      window.sessionStorage.removeItem(coiReloadFlag);
    }
  });
}
