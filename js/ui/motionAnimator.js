/**
 * @file motionAnimator.js
 * @description Facade Pattern over the Motion animation library (v11).
 * Uses ESM import from jsDelivr with fallback to window.Motion.
 */

import { animate, stagger } from "https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm";

export const motionAnimator = {
    /**
     * Animates the dashboard components when weather data finishes loading.
     */
    animateDashboardEntrance() {
        try {
            const heroTemp = document.querySelector(".temp");
            const heroIcon = document.querySelector("#heroIconContainer");

            if (heroTemp) {
                animate(
                    heroTemp,
                    { opacity: [0, 1], y: [14, 0], scale: [0.95, 1] },
                    { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
                );
            }
            if (heroIcon) {
                animate(
                    heroIcon,
                    { opacity: [0, 1], scale: [0.6, 1], rotate: [-12, 0] },
                    { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }
                );
            }

            const hourlyItems = document.querySelectorAll(".forecast-item");
            if (hourlyItems.length) {
                animate(
                    hourlyItems,
                    { opacity: [0, 1], y: [16, 0] },
                    { duration: 0.38, delay: stagger(0.045), ease: "easeOut" }
                );
            }

            const dailyRows = document.querySelectorAll(".daily-row");
            if (dailyRows.length) {
                animate(
                    dailyRows,
                    { opacity: [0, 1], x: [16, 0] },
                    { duration: 0.38, delay: stagger(0.055), ease: "easeOut" }
                );
            }

            const rangeBars = document.querySelectorAll(".daily-bar-fill");
            rangeBars.forEach((bar, i) => {
                const targetWidth = bar.getAttribute("data-width") || "50%";
                animate(
                    bar,
                    { width: ["0%", targetWidth] },
                    { duration: 0.65, delay: 0.12 + i * 0.06, ease: [0.22, 1, 0.36, 1] }
                );
            });

            const metricCards = document.querySelectorAll(".metric-card");
            if (metricCards.length) {
                animate(
                    metricCards,
                    { opacity: [0, 1], scale: [0.94, 1] },
                    { duration: 0.35, delay: stagger(0.04), ease: "easeOut" }
                );
            }
        } catch {
            // Fail gracefully if reduced motion or animation interrupted
        }
    },

    /**
     * Directional slide + stagger animation when switching Hourly Timeline pages.
     * @param {number} [direction=1] 1 for next page, -1 for previous page
     */
    animateHourlyPageChange(direction = 1) {
        try {
            const hourlyItems = document.querySelectorAll(".forecast-item");
            if (hourlyItems.length) {
                const offsetX = direction >= 0 ? 34 : -34;
                animate(
                    hourlyItems,
                    {
                        opacity: [0, 1],
                        x: [offsetX, 0],
                        scale: [0.94, 1],
                    },
                    {
                        duration: 0.38,
                        delay: stagger(0.045),
                        ease: [0.22, 1, 0.36, 1],
                    }
                );
            }

            const activeDot = document.querySelector(".hourly-dot.active");
            if (activeDot) {
                animate(
                    activeDot,
                    { scale: [0.8, 1.08, 1] },
                    { duration: 0.3, ease: "easeOut" }
                );
            }
        } catch {}
    },

    /**
     * Pulse animation across temperature readouts when toggling °C / °F.
     */
    animateUnitChange() {
        try {
            const tempElements = document.querySelectorAll(
                ".temp, .forecast-temp, .daily-min, .daily-max, #metricFeelsLike"
            );
            if (tempElements.length) {
                animate(
                    tempElements,
                    { scale: [0.92, 1], opacity: [0.5, 1] },
                    { duration: 0.25, ease: "easeOut" }
                );
            }
        } catch {}
    },

    /**
     * Tactile button press animation for Search and Geolocation buttons.
     * @param {HTMLElement | null} buttonEl
     */
    animateButtonPress(buttonEl) {
        if (!buttonEl) return;
        try {
            animate(
                buttonEl,
                { scale: [0.88, 1.06, 1] },
                { duration: 0.3, ease: "easeOut" }
            );
        } catch {}
    },
};
