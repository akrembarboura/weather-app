/**
 * @file weatherView.js
 * @description Reactive View Layer Pattern with Lucide Vector Icons & Motion Animations.
 * Renders all UI icons dynamically from UI_ICONS and weather condition metadata.
 */

import { API_CONFIG, UI_ICONS } from "../config/constants.js";
import { formatTemp, formatWindSpeed } from "../utils/weatherAdapters.js";
import { motionAnimator } from "./motionAnimator.js";

export class WeatherView {
    constructor() {
        this.els = {
            body: document.body,
            searchBtn: document.getElementById("searchBtn"),
            geoBtn: document.getElementById("geoBtn"),
            themeBtn: document.getElementById("themeBtn"),
            unitBtnC: document.getElementById("unitBtnC"),
            unitBtnF: document.getElementById("unitBtnF"),
            recentCitiesList: document.getElementById("recentCitiesList"),
            skeletonLoader: document.getElementById("skeletonLoader"),
            errorBanner: document.getElementById("errorBanner"),
            errorMsg: document.getElementById("error-msg"),
            dashboardContent: document.getElementById("dashboardContent"),

            cityName: document.querySelector(".city"),
            countryBadge: document.getElementById("countryBadge"),
            localTime: document.getElementById("localTime"),
            heroIconContainer: document.getElementById("heroIconContainer"),
            tempMain: document.querySelector(".temp"),
            description: document.querySelector(".description"),
            tempHighLow: document.getElementById("tempHighLow"),
            cacheBadge: document.getElementById("cacheBadge"),

            hourlyList: document.querySelector(".forecast-list"),
            hourlyPrevBtn: document.getElementById("hourlyPrevBtn"),
            hourlyNextBtn: document.getElementById("hourlyNextBtn"),
            hourlyPageDots: document.getElementById("hourlyPageDots"),
            dailyList: document.getElementById("dailyForecastList"),

            humidity: document.querySelector(".humidity"),
            wind: document.querySelector(".wind"),
            feelsLike: document.getElementById("metricFeelsLike"),
            pressure: document.getElementById("metricPressure"),
            visibility: document.getElementById("metricVisibility"),
            sunTimes: document.getElementById("metricSunTimes"),
        };
    }

    /**
     * Converts all `<i data-lucide="...">` placeholders into crisp SVG icons.
     */
    refreshLucideIcons() {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons();
        }
    }

    /**
     * Master reactive render method subscribed to WeatherStore.
     * @param {Object} state
     */
    render(state) {
        this.#renderActionButtons(state);
        this.#renderThemeAndUnit(state);
        this.#renderRecentCities(state.recentCities, state.current?.city);

        if (state.status === "loading") {
            this.#showLoadingState(Boolean(state.current));
            this.refreshLucideIcons();
            return;
        }

        if (state.status === "error") {
            this.#showErrorState(state.errorMessage);
            this.refreshLucideIcons();
            return;
        }

        if (state.status === "success" && state.current) {
            this.#showSuccessState(state);
            this.refreshLucideIcons();

            if (state.lastAction === "weather") {
                motionAnimator.animateDashboardEntrance();
            } else if (state.lastAction === "hourlyPage") {
                motionAnimator.animateHourlyPageChange(state.hourlyPageDirection);
            } else if (state.lastAction === "unit") {
                motionAnimator.animateUnitChange();
            }
        } else {
            this.refreshLucideIcons();
        }
    }

    /**
     * Dynamically renders Search & Geolocation button Lucide icons
     * (switches to animated loader-2 icon while fetching!).
     */
    #renderActionButtons(state) {
        const isLoading = state.status === "loading";
        if (this.els.searchBtn) {
            const icon = isLoading ? UI_ICONS.LOADER : UI_ICONS.SEARCH_SUBMIT;
            const spinClass = isLoading ? "spin-icon" : "";
            this.els.searchBtn.innerHTML = `<i data-lucide="${icon}" class="${spinClass}"></i>`;
        }
        if (this.els.geoBtn) {
            const icon = isLoading ? UI_ICONS.LOADER : UI_ICONS.GEO_LOCATE;
            const spinClass = isLoading ? "spin-icon" : "";
            this.els.geoBtn.innerHTML = `<i data-lucide="${icon}" class="${spinClass}"></i>`;
        }
    }

    #renderThemeAndUnit(state) {
        const isLight = state.theme === "light";
        this.els.body.classList.toggle("light", isLight);
        if (this.els.themeBtn) {
            const iconName = isLight ? UI_ICONS.THEME_LIGHT : UI_ICONS.THEME_DARK;
            this.els.themeBtn.innerHTML = `<i data-lucide="${iconName}"></i>`;
            this.els.themeBtn.setAttribute(
                "aria-label",
                isLight ? "Switch to dark mode" : "Switch to light mode"
            );
        }

        if (this.els.unitBtnC && this.els.unitBtnF) {
            this.els.unitBtnC.classList.toggle("active", state.unit === "C");
            this.els.unitBtnF.classList.toggle("active", state.unit === "F");
        }

        if (state.current?.accent) {
            this.els.body.setAttribute("data-weather-accent", state.current.accent);
        }
    }

    #renderRecentCities(recentCities = [], activeCity = "") {
        if (!this.els.recentCitiesList) return;
        this.els.recentCitiesList.innerHTML = recentCities
            .map((city) => {
                const isActive = city.toLowerCase() === (activeCity || "").toLowerCase();
                return `
                    <button
                        type="button"
                        class="recent-chip ${isActive ? "active" : ""}"
                        data-city="${city}"
                    >
                        <i data-lucide="${UI_ICONS.CITY_PIN}" class="chip-pin-icon inline-xs-icon"></i>
                        <span>${city}</span>
                    </button>
                `;
            })
            .join("");
    }

    #showLoadingState(hasExistingWeather) {
        if (this.els.errorBanner) this.els.errorBanner.style.display = "none";
        if (this.els.skeletonLoader && !hasExistingWeather) {
            this.els.skeletonLoader.style.display = "grid";
        }
        if (this.els.dashboardContent) {
            this.els.dashboardContent.style.opacity = "0.5";
        }
    }

    #showErrorState(message) {
        if (this.els.skeletonLoader) this.els.skeletonLoader.style.display = "none";
        if (this.els.dashboardContent) this.els.dashboardContent.style.opacity = "1";
        if (this.els.errorBanner) {
            this.els.errorBanner.style.display = "flex";
        }
        if (this.els.errorMsg) {
            this.els.errorMsg.textContent = message;
        }
    }

    #showSuccessState(state) {
        const { current, hourly, hourlyPage = 0, daily, unit, fromCache, updatedAt } = state;

        if (this.els.skeletonLoader) this.els.skeletonLoader.style.display = "none";
        if (this.els.errorBanner) this.els.errorBanner.style.display = "none";
        if (this.els.dashboardContent) {
            this.els.dashboardContent.style.display = "grid";
            this.els.dashboardContent.style.opacity = "1";
        }

        if (this.els.cityName) this.els.cityName.textContent = current.city;
        if (this.els.countryBadge) {
            this.els.countryBadge.textContent = current.country || "";
            this.els.countryBadge.style.display = current.country ? "inline-flex" : "none";
        }
        if (this.els.localTime) this.els.localTime.textContent = current.localDateLabel;

        if (this.els.heroIconContainer) {
            this.els.heroIconContainer.innerHTML = `
                <i data-lucide="${current.lucideIcon}" class="hero-lucide-icon" data-icon-tone="${current.iconTone}"></i>
            `;
        }

        if (this.els.tempMain) {
            this.els.tempMain.textContent = `${formatTemp(current.tempC, unit)}${unit}`;
        }
        if (this.els.description) {
            this.els.description.textContent = current.description;
        }
        if (this.els.tempHighLow) {
            this.els.tempHighLow.innerHTML = `
                <i data-lucide="${UI_ICONS.TEMP_HIGH}" class="inline-xs-icon"></i> ${formatTemp(current.tempMaxC, unit)}
                <span class="pill-divider">•</span>
                <i data-lucide="${UI_ICONS.TEMP_LOW}" class="inline-xs-icon"></i> ${formatTemp(current.tempMinC, unit)}
            `;
        }
        if (this.els.cacheBadge) {
            const statusIcon = fromCache ? UI_ICONS.STATUS_CACHED : UI_ICONS.STATUS_LIVE;
            const statusLabel = fromCache
                ? `Cached • Updated ${updatedAt || "recently"}`
                : `Live • Updated ${updatedAt || "just now"}`;
            this.els.cacheBadge.innerHTML = `
                <i data-lucide="${statusIcon}" class="inline-xs-icon"></i>
                <span>${statusLabel}</span>
            `;
        }

        // Atmospheric Metrics Grid
        if (this.els.feelsLike) {
            this.els.feelsLike.textContent = `${formatTemp(current.feelsLikeC, unit)}${unit}`;
        }
        if (this.els.humidity) {
            this.els.humidity.textContent = `${current.humidity}%`;
        }
        if (this.els.wind) {
            this.els.wind.textContent = formatWindSpeed(current.windSpeedMs, unit);
        }
        if (this.els.pressure) {
            this.els.pressure.textContent = `${current.pressure} hPa`;
        }
        if (this.els.visibility) {
            this.els.visibility.textContent = `${current.visibilityKm} km`;
        }
        if (this.els.sunTimes) {
            this.els.sunTimes.textContent = `${current.sunrise} / ${current.sunset}`;
        }

        this.#renderHourlyTimeline(hourly, hourlyPage, unit);
        this.#renderDailyForecast(daily, unit);
    }

    #renderHourlyTimeline(hourly = [], hourlyPage = 0, unit = "C") {
        if (!this.els.hourlyList) return;

        if (this.els.hourlyPageDots) {
            this.els.hourlyPageDots.innerHTML = [0, 1]
                .map(
                    (idx) => `
                    <button
                        type="button"
                        class="hourly-dot ${idx === hourlyPage ? "active" : ""}"
                        data-page="${idx}"
                        aria-label="Timeline section ${idx + 1}"
                    ></button>
                `
                )
                .join("");
        }

        this.els.hourlyList.innerHTML = hourly
            .map(
                (item, index) => `
                <div class="forecast-item ${index === 0 ? "is-now" : ""}" title="${item.description}">
                    <span class="forecast-time">${item.timeLabel}</span>
                    <div class="forecast-icon-box" data-icon-tone="${item.iconTone}">
                        <i data-lucide="${item.lucideIcon}" class="forecast-lucide"></i>
                    </div>
                    ${
                        item.popPercent > 0
                            ? `<span class="forecast-pop"><i data-lucide="${UI_ICONS.PRECIPITATION}" class="pop-lucide"></i>${item.popPercent}%</span>`
                            : `<span class="forecast-pop forecast-pop-empty">&nbsp;</span>`
                    }
                    <span class="forecast-temp">${formatTemp(item.tempC, unit)}</span>
                    <span class="forecast-desc">${item.description}</span>
                </div>
            `
            )
            .join("");
    }

    #renderDailyForecast(daily = [], unit = "C") {
        if (!this.els.dailyList) return;

        this.els.dailyList.innerHTML = daily
            .map(
                (day, index) => `
                <div class="daily-row ${index === 0 ? "is-today" : ""}">
                    <div class="daily-day-col">
                        <span class="daily-day-name">${day.dayLabel}</span>
                        <span class="daily-date-sub">${day.dateSubLabel}</span>
                    </div>
                    <div class="daily-condition-col" title="${day.description}">
                        <div class="daily-icon-box" data-icon-tone="${day.iconTone}">
                            <i data-lucide="${day.lucideIcon}" class="daily-lucide"></i>
                        </div>
                        <div class="daily-cond-meta">
                            <span class="daily-cond-text">${day.description}</span>
                            ${
                                day.popPercent > 10
                                    ? `<span class="daily-pop"><i data-lucide="${UI_ICONS.PRECIPITATION}" class="pop-lucide"></i>${day.popPercent}%</span>`
                                    : ""
                            }
                        </div>
                    </div>
                    <div class="daily-range-col">
                        <span class="daily-min">${formatTemp(day.minC, unit)}</span>
                        <div class="daily-bar-track">
                            <div
                                class="daily-bar-fill"
                                data-width="${day.barWidthPercent}%"
                                style="left: ${day.barLeftPercent}%; width: ${day.barWidthPercent}%;"
                            ></div>
                        </div>
                        <span class="daily-max">${formatTemp(day.maxC, unit)}</span>
                    </div>
                </div>
            `
            )
            .join("");
    }
}
