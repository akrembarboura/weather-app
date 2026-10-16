/**
 * @file weatherAdapters.js
 * @description Adapter / Data Mapper Pattern & Pure Formatting Functions.
 * Transforms raw OpenWeatherMap API responses into normalized UI view models.
 */

import { WEATHER_CONDITION_MAP, DEFAULT_CONDITION } from "../config/constants.js";

export function getConditionMeta(mainCondition) {
    return WEATHER_CONDITION_MAP[mainCondition] || DEFAULT_CONDITION;
}

export function formatTemp(tempCelsius, unit = "C") {
    if (typeof tempCelsius !== "number" || Number.isNaN(tempCelsius)) return "--°";
    const value = unit === "F" ? (tempCelsius * 9) / 5 + 32 : tempCelsius;
    return `${Math.round(value)}°`;
}

export function formatWindSpeed(speedMetersPerSec, unit = "C") {
    if (typeof speedMetersPerSec !== "number") return "--";
    if (unit === "F") {
        return `${Math.round(speedMetersPerSec * 2.23694)} mph`;
    }
    return `${Math.round(speedMetersPerSec * 3.6)} km/h`;
}

export function formatCityTime(unixSeconds, timezoneOffsetSeconds = 0) {
    const localMs = (unixSeconds + timezoneOffsetSeconds) * 1000;
    const date = new Date(localMs);
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

export function formatLocalDateHeader(timezoneOffsetSeconds = 0) {
    const nowUtcSeconds = Math.floor(Date.now() / 1000);
    const localMs = (nowUtcSeconds + timezoneOffsetSeconds) * 1000;
    const date = new Date(localMs);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const timeStr = formatCityTime(nowUtcSeconds, timezoneOffsetSeconds);
    return `${days[date.getUTCDay()]}, ${date.getUTCDate()} ${months[date.getUTCMonth()]} • ${timeStr} Local`;
}

export function adaptCurrentWeather(raw) {
    const weatherItem = (raw.weather && raw.weather[0]) || {};
    const meta = getConditionMeta(weatherItem.main);
    const timezone = raw.timezone || 0;

    return {
        city: raw.name || "Unknown",
        country: (raw.sys && raw.sys.country) || "",
        tempC: raw.main?.temp ?? 0,
        feelsLikeC: raw.main?.feels_like ?? 0,
        tempMinC: raw.main?.temp_min ?? 0,
        tempMaxC: raw.main?.temp_max ?? 0,
        humidity: raw.main?.humidity ?? 0,
        pressure: raw.main?.pressure ?? 0,
        windSpeedMs: raw.wind?.speed ?? 0,
        visibilityKm: raw.visibility ? (raw.visibility / 1000).toFixed(1) : "10.0",
        conditionMain: weatherItem.main || "Clear",
        description: weatherItem.description || meta.label,
        iconPath: meta.icon,
        lucideIcon: meta.lucide,
        iconTone: meta.tone,
        badge: meta.badge,
        accent: meta.accent,
        sunrise: raw.sys?.sunrise ? formatCityTime(raw.sys.sunrise, timezone) : "06:15",
        sunset: raw.sys?.sunset ? formatCityTime(raw.sys.sunset, timezone) : "18:45",
        localDateLabel: formatLocalDateHeader(timezone),
    };
}

export function adaptForecastData(rawForecast) {
    const list = Array.isArray(rawForecast?.list) ? rawForecast.list : [];
    const timezone = rawForecast?.city?.timezone || 0;

    const hourly = list.slice(0, 8).map((item, index) => {
        const condition = item.weather?.[0]?.main || "Clear";
        const meta = getConditionMeta(condition);
        const popPercent = Math.round((item.pop || 0) * 100);

        return {
            timeLabel: index === 0 ? "Now" : formatCityTime(item.dt, timezone),
            tempC: item.main?.temp ?? 0,
            condition,
            description: item.weather?.[0]?.description || meta.label,
            badge: meta.badge,
            iconPath: meta.icon,
            lucideIcon: meta.lucide,
            iconTone: meta.tone,
            popPercent,
        };
    });

    const dayGroups = new Map();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    list.forEach((item) => {
        const localDate = new Date((item.dt + timezone) * 1000);
        const dateKey = `${localDate.getUTCFullYear()}-${String(localDate.getUTCMonth() + 1).padStart(2, "0")}-${String(localDate.getUTCDate()).padStart(2, "0")}`;

        if (!dayGroups.has(dateKey)) {
            dayGroups.set(dateKey, {
                dateKey,
                dayName: dayNames[localDate.getUTCDay()],
                dateSubLabel: `${shortMonths[localDate.getUTCMonth()]} ${localDate.getUTCDate()}`,
                tempsMin: [],
                tempsMax: [],
                conditions: [],
                descriptions: [],
                maxPop: 0,
            });
        }

        const group = dayGroups.get(dateKey);
        group.tempsMin.push(item.main?.temp_min ?? item.main?.temp ?? 0);
        group.tempsMax.push(item.main?.temp_max ?? item.main?.temp ?? 0);
        group.conditions.push(item.weather?.[0]?.main || "Clear");
        group.descriptions.push(item.weather?.[0]?.description || "");
        group.maxPop = Math.max(group.maxPop, Math.round((item.pop || 0) * 100));
    });

    const daily = Array.from(dayGroups.values())
        .slice(0, 5)
        .map((group, idx) => {
            const minC = Math.min(...group.tempsMin);
            const maxC = Math.max(...group.tempsMax);
            const midIdx = Math.floor(group.conditions.length / 2);
            const dominantCondition = group.conditions[midIdx] || group.conditions[0] || "Clear";
            const dominantDesc = group.descriptions[midIdx] || group.descriptions[0] || "";
            const meta = getConditionMeta(dominantCondition);

            return {
                dayLabel: idx === 0 ? "Today" : group.dayName.slice(0, 3),
                dateSubLabel: group.dateSubLabel,
                minC,
                maxC,
                condition: dominantCondition,
                description: dominantDesc || meta.label,
                badge: meta.badge,
                iconPath: meta.icon,
                lucideIcon: meta.lucide,
                iconTone: meta.tone,
                popPercent: group.maxPop,
            };
        });

    const globalMinC = daily.length ? Math.min(...daily.map((d) => d.minC)) : 0;
    const globalMaxC = daily.length ? Math.max(...daily.map((d) => d.maxC)) : 1;
    const totalSpan = Math.max(globalMaxC - globalMinC, 1);

    const dailyWithBars = daily.map((d) => ({
        ...d,
        barLeftPercent: Math.max(0, Math.min(88, ((d.minC - globalMinC) / totalSpan) * 100)),
        barWidthPercent: Math.max(12, Math.min(100, ((d.maxC - d.minC) / totalSpan) * 100)),
    }));

    return { hourly, daily: dailyWithBars };
}
