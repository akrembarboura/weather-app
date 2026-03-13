const apiKey = "29a9556d6506441debe7af208c3015cf";
const apiBaseUrl = "https://api.openweathermap.org/data/2.5";

const searchBox    = document.querySelector(".search input");
const searchBtn    = document.querySelector(".search button");
const weatherIcon  = document.querySelector(".weather-icon");
const weatherDiv   = document.querySelector(".weather");
const errorDiv     = document.querySelector(".error");
const forecastDiv  = document.querySelector(".forecast");
const forecastList = document.querySelector(".forecast-list");

const weatherIcons = {
    "Clouds":  "assets/images/clouds.png",
    "Clear":   "assets/images/clear.png",
    "Rain":    "assets/images/rain.png",
    "Drizzle": "assets/images/drizzle.png",
    "Mist":    "assets/images/mist.png",
    "Snow":    "assets/images/snow.png",
};

const weatherEmojis = {
    "Clouds":  "⛅",
    "Clear":   "☀️",
    "Rain":    "🌧️",
    "Drizzle": "🌦️",
    "Mist":    "🌫️",
    "Snow":    "❄️",
};

// ─── UPDATE CURRENT WEATHER UI ──────────────────
function updateUI(data) {
    document.querySelector(".city").innerHTML        = data.name;
    document.querySelector(".temp").innerHTML        = Math.round(data.main.temp) + "°C";
    document.querySelector(".humidity").innerHTML    = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML        = data.wind.speed + " km/h";
    document.querySelector(".description").innerHTML = `It's ${data.weather[0].description} in ${data.name}`;

    weatherIcon.src = weatherIcons[data.weather[0].main] || "assets/images/rain.png";

    weatherDiv.style.display  = "block";
    errorDiv.style.display    = "none";
}

// ─── UPDATE FORECAST UI ─────────────────────────
function updateForecast(data) {
    forecastList.innerHTML = "";

    // خذ فقط قراءات اليوم الحالي
    const today = new Date().toISOString().split("T")[0];

    const todayItems = data.list.filter(item =>
        item.dt_txt.startsWith(today)
    );

    // إذا ما في قراءات لليوم (مثلاً وقت متأخر) — خذ أول 8 قراءات
    const items = todayItems.length > 0 ? todayItems : data.list.slice(0, 8);

    items.forEach(item => {
        const time      = item.dt_txt.split(" ")[1].slice(0, 5); // "06:00"
        const temp      = Math.round(item.main.temp);
        const condition = item.weather[0].main;
        const emoji     = weatherEmojis[condition] || "🌡️";

        forecastList.innerHTML += `
            <div class="forecast-item">
                <span class="forecast-time">${time}</span>
                <span class="forecast-emoji">${emoji}</span>
                <span class="forecast-temp">${temp}°C</span>
                <span class="forecast-desc">${item.weather[0].description}</span>
            </div>
        `;
    });

    forecastDiv.style.display = "block";
}

// ─── FETCH CURRENT WEATHER ──────────────────────
async function fetchWeather(url, forecastUrl) {
    try {
        const [weatherRes, forecastRes] = await Promise.all([
            fetch(url),
            fetch(forecastUrl)
        ]);

        if (weatherRes.status === 404) {
            errorDiv.style.display   = "flex";
            weatherDiv.style.display = "none";
            forecastDiv.style.display = "none";
            return;
        }

        const weatherData  = await weatherRes.json();
        const forecastData = await forecastRes.json();

        updateUI(weatherData);
        updateForecast(forecastData);

    } catch (error) {
        errorDiv.style.display   = "flex";
        weatherDiv.style.display = "none";
        forecastDiv.style.display = "none";
    }
}

// ─── SEARCH BY CITY ─────────────────────────────
function checkWeather(city) {
    if (!city.trim()) return;
    fetchWeather(
        `${apiBaseUrl}/weather?units=metric&q=${city}&appid=${apiKey}`,
        `${apiBaseUrl}/forecast?units=metric&q=${city}&appid=${apiKey}`
    );
}

// ─── SEARCH BY COORDS ───────────────────────────
function checkWeatherByCoords(lat, lon) {
    fetchWeather(
        `${apiBaseUrl}/weather?units=metric&lat=${lat}&lon=${lon}&appid=${apiKey}`,
        `${apiBaseUrl}/forecast?units=metric&lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
}

// ─── GEOLOCATION ON LOAD ────────────────────────
window.addEventListener("load", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => checkWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
            ()    => checkWeather("Tunis")
        );
    } else {
        checkWeather("Tunis");
    }
});

// ─── EVENTS ─────────────────────────────────────
searchBtn.addEventListener("click",  () => checkWeather(searchBox.value));
searchBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkWeather(searchBox.value);
});