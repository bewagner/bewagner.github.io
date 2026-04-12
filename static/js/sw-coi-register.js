if (!crossOriginIsolated && "serviceWorker" in navigator) {
  navigator.serviceWorker.register("/coi-serviceworker.js").then(function () {
    return navigator.serviceWorker.ready;
  }).then(function () {
    if (!crossOriginIsolated) {
      window.location.reload();
    }
  });
}
