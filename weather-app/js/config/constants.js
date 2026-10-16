/**
 * @file constants.js
 * @description Centralized Configuration & Strategy Map Pattern.
 * Centralizes API settings, Lucide icon mappings, and weather condition lookup tables.
 */

export const API_CONFIG = {
    KEY: "29a9556d6506441debe7af208c3015cf",
    BASE_URL: "https://api.openweathermap.org/data/2.5",
    DEFAULT_CITY: "Tunis",
    CACHE_TTL_MS: 10 * 60 * 1000, // 10 minutes cache TTL
    MAX_RECENT_CITIES: 5,
    HOURLY_PAGE_SIZE: 4,
};

export const UI_ICONS = {
    BRAND: "cloud-sun",
    STATUS_LIVE: "radio",
    STATUS_CACHED: "zap",
    SEARCH_LEADING: "search",
    SEARCH_SUBMIT: "arrow-right",
    GEO_LOCATE: "locate-fixed",
    LOADER: "loader-2",
    THEME_DARK: "moon",
    THEME_LIGHT: "sun",
    RECENT_HISTORY: "history",
    CITY_PIN: "map-pin",
    ALERT_ERROR: "alert-triangle",
    TEMP_HIGH: "arrow-up",
    TEMP_LOW: "arrow-down",
    PRECIPITATION: "droplets",
    CHEVRON_LEFT: "chevron-left",
    CHEVRON_RIGHT: "chevron-right",
};

/**
 * Strategy Lookup Map for weather conditions.
 * Maps OpenWeatherMap `weather[0].main` values to Lucide vector icons,
 * color tones, local image fallbacks, and dynamic ambient accent themes.
 */
export const WEATHER_CONDITION_MAP = {
    Clear: {
        icon: "assets/images/clear.png",
        lucide: "sun",
        tone: "amber",
        badge: "☀️",
        label: "Clear Sky",
        accent: "sunny",
    },
    Clouds: {
        icon: "assets/images/clouds.png",
        lucide: "cloud",
        tone: "sky",
        badge: "⛅",
        label: "Cloudy",
        accent: "cloudy",
    },
    Rain: {
        icon: "assets/images/rain.png",
        lucide: "cloud-rain",
        tone: "blue",
        badge: "🌧️",
        label: "Rainy",
        accent: "rainy",
    },
    Drizzle: {
        icon: "assets/images/drizzle.png",
        lucide: "cloud-drizzle",
        tone: "sky",
        badge: "🌦️",
        label: "Light Drizzle",
        accent: "rainy",
    },
    Thunderstorm: {
        icon: "assets/images/rain.png",
        lucide: "cloud-lightning",
        tone: "indigo",
        badge: "⛈️",
        label: "Thunderstorm",
        accent: "stormy",
    },
    Snow: {
        icon: "assets/images/snow.png",
        lucide: "snowflake",
        tone: "ice",
        badge: "❄️",
        label: "Snowfall",
        accent: "snowy",
    },
    Mist: {
        icon: "assets/images/mist.png",
        lucide: "cloud-fog",
        tone: "slate",
        badge: "🌫️",
        label: "Misty",
        accent: "misty",
    },
    Smoke: {
        icon: "assets/images/mist.png",
        lucide: "cloud-fog",
        tone: "slate",
        badge: "🌫️",
        label: "Smoky",
        accent: "misty",
    },
    Haze: {
        icon: "assets/images/mist.png",
        lucide: "cloud-fog",
        tone: "slate",
        badge: "🌫️",
        label: "Hazy",
        accent: "misty",
    },
    Fog: {
        icon: "assets/images/mist.png",
        lucide: "cloud-fog",
        tone: "slate",
        badge: "🌫️",
        label: "Foggy",
        accent: "misty",
    },
};

export const DEFAULT_CONDITION = {
    icon: "assets/images/clouds.png",
    lucide: "cloud-sun",
    tone: "sky",
    badge: "🌡️",
    label: "Weather",
    accent: "default",
};

