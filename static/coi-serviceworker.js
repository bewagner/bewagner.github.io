/*
 * coi-serviceworker - cross-origin isolation via service worker
 * Adds Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers
 * so that SharedArrayBuffer (required by Z3 WASM threads) is available.
 * Based on: https://github.com/gzuidhof/coi-serviceworker (MIT)
 */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", function (event) {
  const { request } = event;
  // Don't intercept non-GET or chrome-extension requests
  if (request.method !== "GET") return;

  event.respondWith(
    fetch(request).then(function (response) {
      // Don't modify responses that already have COEP
      if (response.headers.get("Cross-Origin-Embedder-Policy")) {
        return response;
      }
      const headers = new Headers(response.headers);
      headers.set("Cross-Origin-Opener-Policy", "same-origin");
      headers.set("Cross-Origin-Embedder-Policy", "require-corp");
      headers.set("Cross-Origin-Resource-Policy", "cross-origin");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    })
  );
});
