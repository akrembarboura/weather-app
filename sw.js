const CACHE_NAME = "atmosphere-pwa-v1";
const APP_SHELL = [
    "./",
    "./index.html",
    "./css/style.css",
    "./js/main.js",
    "./js/config/constants.js",
    "./js/utils/weatherAdapters.js",
    "./js/services/storageService.js",
    "./js/services/weatherService.js",
    "./js/store/weatherStore.js",
    "./js/ui/motionAnimator.js",
    "./js/ui/weatherView.js",
    "./assets/favicon.svg",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;

    // Network-first for OpenWeatherMap API calls, Cache-fallback for app shell
    if (request.url.includes("api.openweathermap.org")) {
        return;
    }

    event.respondWith(
        fetch(request)
            .then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
                return response;
            })
            .catch(() => caches.match(request))
    );
});
