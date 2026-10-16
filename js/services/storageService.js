/**
 * @file storageService.js
 * @description Repository & Cache-Aside Pattern over browser LocalStorage.
 * Manages user preferences (theme, temperature unit, recent cities) and
 * TTL-based weather response caching.
 */

import { API_CONFIG } from "../config/constants.js";

const STORAGE_KEYS = {
    THEME: "weather_app_theme",
    UNIT: "weather_app_unit",
    RECENT_CITIES: "weather_app_recent_cities",
    CACHE_PREFIX: "weather_app_cache_v3_",
};

export const storageService = {
    getPreferences() {
        try {
            const theme = localStorage.getItem(STORAGE_KEYS.THEME) || localStorage.getItem("theme") || "dark";
            const unit = localStorage.getItem(STORAGE_KEYS.UNIT) || "C";
            const recentRaw = localStorage.getItem(STORAGE_KEYS.RECENT_CITIES);
            const recentCities = recentRaw ? JSON.parse(recentRaw) : ["Tunis", "London", "Paris", "Tokyo"];
            return { theme, unit, recentCities };
        } catch {
            return { theme: "dark", unit: "C", recentCities: ["Tunis", "London", "Paris", "Tokyo"] };
        }
    },

    setTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEYS.THEME, theme);
            localStorage.setItem("theme", theme);
        } catch {}
    },

    setUnit(unit) {
        try {
            localStorage.setItem(STORAGE_KEYS.UNIT, unit);
        } catch {}
    },

    addRecentCity(cityName) {
        if (!cityName) return this.getPreferences().recentCities;
        try {
            const { recentCities } = this.getPreferences();
            const normalized = cityName.trim();
            const filtered = recentCities.filter((c) => c.toLowerCase() !== normalized.toLowerCase());
            const updated = [normalized, ...filtered].slice(0, API_CONFIG.MAX_RECENT_CITIES);
            localStorage.setItem(STORAGE_KEYS.RECENT_CITIES, JSON.stringify(updated));
            return updated;
        } catch {
            return [cityName];
        }
    },

    getCachedWeather(cacheKey) {
        try {
            const key = STORAGE_KEYS.CACHE_PREFIX + cacheKey.toLowerCase();
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const entry = JSON.parse(raw);
            if (Date.now() - entry.timestamp > API_CONFIG.CACHE_TTL_MS) {
                localStorage.removeItem(key);
                return null;
            }
            return entry.payload;
        } catch {
            return null;
        }
    },

    setCachedWeather(cacheKey, payload) {
        try {
            const key = STORAGE_KEYS.CACHE_PREFIX + cacheKey.toLowerCase();
            localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), payload }));
        } catch {}
    },
};

