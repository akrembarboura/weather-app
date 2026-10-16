/**
 * @file weatherStore.js
 * @description Observer / Pub-Sub State Management Pattern.
 * Maintains a single source of truth for the application state and
 * notifies all subscribed UI views whenever state transitions occur.
 */

import { API_CONFIG } from "../config/constants.js";
import { storageService } from "../services/storageService.js";

class WeatherStore {
    constructor() {
        const prefs = storageService.getPreferences();

        this.state = {
            status: "idle", // 'idle' | 'loading' | 'success' | 'error'
            lastAction: "init",
            current: null,
            hourly: [],
            hourlyPage: 0,
            hourlyPageDirection: 1, // 1 = next, -1 = prev
            daily: [],
            unit: prefs.unit, // 'C' | 'F'
            theme: prefs.theme, // 'dark' | 'light'
            recentCities: prefs.recentCities,
            errorMessage: null,
            fromCache: false,
            updatedAt: null,
        };

        /** @type {Set<Function>} */
        this.listeners = new Set();
    }

    getState() {
        return { ...this.state };
    }

    subscribe(listener) {
        this.listeners.add(listener);
        listener(this.getState());
        return () => this.listeners.delete(listener);
    }

    setState(partialState) {
        this.state = {
            ...this.state,
            ...partialState,
        };
        this.#notify();
    }

    #notify() {
        const snapshot = this.getState();
        this.listeners.forEach((listener) => listener(snapshot));
    }

    setLoading() {
        this.setState({
            status: "loading",
            lastAction: "loading",
            errorMessage: null,
        });
    }

    setWeatherSuccess(payload) {
        const updatedRecent = storageService.addRecentCity(payload.current.city);
        this.setState({
            status: "success",
            lastAction: "weather",
            current: payload.current,
            hourly: payload.hourly,
            hourlyPage: 0,
            hourlyPageDirection: 1,
            daily: payload.daily,
            fromCache: Boolean(payload.fromCache),
            updatedAt: payload.updatedAt,
            recentCities: updatedRecent,
            errorMessage: null,
        });
    }

    setError(message) {
        this.setState({
            status: "error",
            lastAction: "error",
            errorMessage: message || "Unable to fetch weather data.",
        });
    }

    toggleTheme() {
        const nextTheme = this.state.theme === "dark" ? "light" : "dark";
        storageService.setTheme(nextTheme);
        this.setState({ theme: nextTheme, lastAction: "theme" });
    }

    setUnit(unit) {
        if (unit !== "C" && unit !== "F") return;
        if (this.state.unit === unit) return;
        storageService.setUnit(unit);
        this.setState({ unit, lastAction: "unit" });
    }

    setHourlyPage(targetPage) {
        const pageSize = API_CONFIG.HOURLY_PAGE_SIZE || 4;
        const totalPages = Math.max(1, Math.ceil((this.state.hourly?.length || 0) / pageSize));
        const clampedPage = Math.max(0, Math.min(totalPages - 1, targetPage));
        if (clampedPage === this.state.hourlyPage) return;

        const direction = clampedPage > this.state.hourlyPage ? 1 : -1;
        this.setState({
            hourlyPage: clampedPage,
            hourlyPageDirection: direction,
            lastAction: "hourlyPage",
        });
    }
}

export const weatherStore = new WeatherStore();
