/**
 * @file weatherService.js
 * @description Service Layer Pattern with Request Cancellation (AbortController)
 * and Cache-Aside integration.
 * Isolates all network HTTP calls, error classification, and response adaptation.
 */

import { API_CONFIG } from "../config/constants.js";
import { adaptCurrentWeather, adaptForecastData } from "../utils/weatherAdapters.js";
import { storageService } from "./storageService.js";

class WeatherService {
    constructor() {
        /** @type {AbortController | null} */
        this.activeController = null;
    }

    /**
     * Cancels any in-flight HTTP request to prevent race conditions.
     */
    cancelActiveRequest() {
        if (this.activeController) {
            this.activeController.abort();
            this.activeController = null;
        }
    }

    /**
     * Fetches current weather + 5-day/3-hour forecast by city name.
     * @param {string} city
     * @param {boolean} [forceRefresh=false]
     */
    async getWeatherByCity(city, forceRefresh = false) {
        const cleanCity = city.trim();
        if (!cleanCity) {
            throw new Error("Please enter a valid city name.");
        }

        const cacheKey = `city_${cleanCity}`;
        if (!forceRefresh) {
            const cached = storageService.getCachedWeather(cacheKey);
            if (cached) {
                return { ...cached, fromCache: true };
            }
        }

        const encodedCity = encodeURIComponent(cleanCity);
        const currentUrl = `${API_CONFIG.BASE_URL}/weather?units=metric&q=${encodedCity}&appid=${API_CONFIG.KEY}`;
        const forecastUrl = `${API_CONFIG.BASE_URL}/forecast?units=metric&q=${encodedCity}&appid=${API_CONFIG.KEY}`;

        const result = await this.#fetchAndAdapt(currentUrl, forecastUrl);
        storageService.setCachedWeather(cacheKey, result);
        return { ...result, fromCache: false };
    }

    /**
     * Fetches current weather + 5-day/3-hour forecast by geographic coordinates.
     * @param {number} lat
     * @param {number} lon
     */
    async getWeatherByCoords(lat, lon) {
        const cacheKey = `coords_${lat.toFixed(2)}_${lon.toFixed(2)}`;
        const cached = storageService.getCachedWeather(cacheKey);
        if (cached) {
            return { ...cached, fromCache: true };
        }

        const currentUrl = `${API_CONFIG.BASE_URL}/weather?units=metric&lat=${lat}&lon=${lon}&appid=${API_CONFIG.KEY}`;
        const forecastUrl = `${API_CONFIG.BASE_URL}/forecast?units=metric&lat=${lat}&lon=${lon}&appid=${API_CONFIG.KEY}`;

        const result = await this.#fetchAndAdapt(currentUrl, forecastUrl);
        storageService.setCachedWeather(cacheKey, result);
        return { ...result, fromCache: false };
    }

    /**
     * Private helper executing concurrent requests with AbortController.
     * @param {string} currentUrl
     * @param {string} forecastUrl
     */
    async #fetchAndAdapt(currentUrl, forecastUrl) {
        this.cancelActiveRequest();
        this.activeController = new AbortController();
        const { signal } = this.activeController;

        try {
            const [weatherRes, forecastRes] = await Promise.all([
                fetch(currentUrl, { signal }),
                fetch(forecastUrl, { signal }),
            ]);

            if (weatherRes.status === 404 || forecastRes.status === 404) {
                const notFoundError = new Error("City not found. Check the spelling and try again.");
                notFoundError.code = "CITY_NOT_FOUND";
                throw notFoundError;
            }

            if (weatherRes.status === 401) {
                const authError = new Error("Invalid or inactive OpenWeatherMap API key.");
                authError.code = "UNAUTHORIZED";
                throw authError;
            }

            if (!weatherRes.ok || !forecastRes.ok) {
                throw new Error("Weather service temporarily unavailable. Please try again.");
            }

            const [rawWeather, rawForecast] = await Promise.all([
                weatherRes.json(),
                forecastRes.json(),
            ]);

            const current = adaptCurrentWeather(rawWeather);
            const { hourly, daily } = adaptForecastData(rawForecast);

            return {
                current,
                hourly,
                daily,
                updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
        } catch (err) {
            if (err.name === "AbortError") {
                const abortErr = new Error("Request cancelled");
                abortErr.code = "ABORTED";
                throw abortErr;
            }
            throw err;
        }
    }
}

export const weatherService = new WeatherService();
