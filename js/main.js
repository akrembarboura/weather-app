/**
 * @file main.js
 * @description Application Controller & Bootstrapper (MVC / Flux Controller Pattern).
 * Connects DOM events to WeatherService, dispatches state transitions to WeatherStore,
 * and enables manual scrollbar-free scrolling (wheel + drag + animated pagination dots).
 */

import { API_CONFIG } from "./config/constants.js";
import { weatherService } from "./services/weatherService.js";
import { weatherStore } from "./store/weatherStore.js";
import { motionAnimator } from "./ui/motionAnimator.js";
import { WeatherView } from "./ui/weatherView.js";

class WeatherController {
    constructor(store, service, view) {
        this.store = store;
        this.service = service;
        this.view = view;

        this.searchBox = document.querySelector(".search input");
        this.searchBtn = document.getElementById("searchBtn");
        this.geoBtn = document.getElementById("geoBtn");
        this.themeBtn = document.getElementById("themeBtn");
        this.unitBtnC = document.getElementById("unitBtnC");
        this.unitBtnF = document.getElementById("unitBtnF");
        this.recentCitiesList = document.getElementById("recentCitiesList");
        this.hourlyList = document.querySelector(".forecast-list");
        this.hourlyPageDots = document.getElementById("hourlyPageDots");
    }

    init() {
        // 1. Subscribe Reactive View to Store (Observer Pattern)
        this.store.subscribe((state) => this.view.render(state));

        // 2. Bind User Interface Events
        this.#bindEvents();

        // 3. Bind Manual Scroll (Wheel + Drag + Animated Dots) on Hourly Timeline
        this.#bindHourlyManualScroll();

        // 4. Load Initial City Weather
        this.loadInitialWeather();
    }

    #bindEvents() {
        this.searchBtn?.addEventListener("click", () => {
            motionAnimator.animateButtonPress(this.searchBtn);
            this.handleSearchSubmit();
        });

        this.searchBox?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                motionAnimator.animateButtonPress(this.searchBtn);
                this.handleSearchSubmit();
            }
        });

        this.geoBtn?.addEventListener("click", () => {
            motionAnimator.animateButtonPress(this.geoBtn);
            this.loadGeolocationWeather();
        });

        this.themeBtn?.addEventListener("click", () => {
            motionAnimator.animateButtonPress(this.themeBtn);
            this.store.toggleTheme();
        });

        this.unitBtnC?.addEventListener("click", () => this.store.setUnit("C"));
        this.unitBtnF?.addEventListener("click", () => this.store.setUnit("F"));

        // Event Delegation Pattern on Recent Cities Bar
        this.recentCitiesList?.addEventListener("click", (e) => {
            const chip = e.target.closest(".recent-chip");
            if (!chip) return;
            const city = chip.getAttribute("data-city");
            if (city) {
                motionAnimator.animateButtonPress(chip);
                if (this.searchBox) this.searchBox.value = city;
                this.loadWeatherByCity(city);
            }
        });
    }

    /**
     * Enables manual scrolling on Hourly Timeline without a visible scrollbar:
     * - Mouse wheel vertical scroll translates to smooth horizontal scroll
     * - Mouse click-and-drag scrolls horizontally
     * - Animated pagination dots sync with scroll position & can be clicked
     */
    #bindHourlyManualScroll() {
        const list = this.hourlyList;
        if (!list) return;

        // 1. Mouse wheel manual horizontal scrolling
        list.addEventListener(
            "wheel",
            (e) => {
                if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                    e.preventDefault();
                    list.scrollBy({ left: e.deltaY * 1.4, behavior: "smooth" });
                }
            },
            { passive: false }
        );

        // 2. Mouse click-and-drag manual scrolling
        let isDown = false;
        let startX = 0;
        let scrollStart = 0;

        list.addEventListener("mousedown", (e) => {
            isDown = true;
            list.classList.add("is-dragging");
            startX = e.pageX - list.offsetLeft;
            scrollStart = list.scrollLeft;
        });

        window.addEventListener("mouseup", () => {
            if (!isDown) return;
            isDown = false;
            list.classList.remove("is-dragging");
        });

        list.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - list.offsetLeft;
            const walk = (x - startX) * 1.3;
            list.scrollLeft = scrollStart - walk;
        });

        // 3. Sync animated pagination dots as user scrolls manually
        list.addEventListener("scroll", () => {
            const maxScroll = list.scrollWidth - list.clientWidth;
            if (maxScroll <= 0) return;
            const progress = list.scrollLeft / maxScroll;
            const activeIdx = progress > 0.45 ? 1 : 0;

            const dots = this.hourlyPageDots?.querySelectorAll(".hourly-dot");
            dots?.forEach((dot, idx) => {
                dot.classList.toggle("active", idx === activeIdx);
            });
        });

        // 4. Clicking pagination dots smoothly scrolls to start/end
        this.hourlyPageDots?.addEventListener("click", (e) => {
            const dot = e.target.closest(".hourly-dot");
            if (!dot) return;
            const page = Number(dot.getAttribute("data-page"));
            const maxScroll = list.scrollWidth - list.clientWidth;
            list.scrollTo({
                left: page === 0 ? 0 : maxScroll,
                behavior: "smooth",
            });
        });
    }

    handleSearchSubmit() {
        const query = this.searchBox?.value?.trim();
        if (!query) return;
        this.loadWeatherByCity(query);
    }

    async loadWeatherByCity(city, forceRefresh = false) {
        this.store.setLoading();
        try {
            const data = await this.service.getWeatherByCity(city, forceRefresh);
            this.store.setWeatherSuccess(data);
        } catch (err) {
            if (err.code === "ABORTED") return;
            this.store.setError(err.message);
        }
    }

    loadGeolocationWeather() {
        if (!navigator.geolocation) {
            this.loadWeatherByCity(API_CONFIG.DEFAULT_CITY);
            return;
        }

        this.store.setLoading();
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const data = await this.service.getWeatherByCoords(
                        pos.coords.latitude,
                        pos.coords.longitude
                    );
                    this.store.setWeatherSuccess(data);
                } catch (err) {
                    if (err.code === "ABORTED") return;
                    this.loadWeatherByCity(API_CONFIG.DEFAULT_CITY);
                }
            },
            () => {
                const fallbackCity =
                    this.store.getState().recentCities?.[0] || API_CONFIG.DEFAULT_CITY;
                this.loadWeatherByCity(fallbackCity);
            },
            { timeout: 5000 }
        );
    }

    loadInitialWeather() {
        const initialCity =
            this.store.getState().recentCities?.[0] || API_CONFIG.DEFAULT_CITY;
        this.loadWeatherByCity(initialCity);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const view = new WeatherView();
    const app = new WeatherController(weatherStore, weatherService, view);
    app.init();
});