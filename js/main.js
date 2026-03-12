const apiKey = "29a9556d6506441debe7af208c3015cf";
const apiBaseUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const weatherDiv = document.querySelector(".weather");
const errorDiv = document.querySelector(".error");

const weatherIcons = {
    "Clouds":  "assets/images/clouds.png",
    "Clear":   "assets/images/clear.png",
    "Rain":    "assets/images/rain.png",
    "Drizzle": "assets/images/drizzle.png",
    "Mist":    "assets/images/mist.png",
    "Snow":    "assets/images/snow.png",
};

//  1. UPDATE UI 
function updateUI(data) {
    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
    document.querySelector(".description").innerHTML =
        `It's ${data.weather[0].description} in ${data.name}`;

    const condition = data.weather[0].main;
    weatherIcon.src = weatherIcons[condition] || "assets/images/rain.png";

    weatherDiv.style.display = "block";
    errorDiv.style.display = "none";
}

// 2. FETCH WEATHER (url flexible) 
async function fetchWeather(url) {
    try {
        const response = await fetch(url);
        if (response.status === 404) {
            errorDiv.style.display = "flex";
            weatherDiv.style.display = "none";
            return;
        }

        const data = await response.json();
        updateUI(data);

    } catch (error) {
        errorDiv.style.display = "flex";
        weatherDiv.style.display = "none";
    }
}

//3. SEARCH BY CITY 
function checkWeather(city) {
    if (!city.trim()) return;
    fetchWeather(`${apiBaseUrl}&q=${city}&appid=${apiKey}`);
}

// 4. SEARCH BY COORDS 
function checkWeatherByCoords(lat, lon) {
    fetchWeather(`${apiBaseUrl}&lat=${lat}&lon=${lon}&appid=${apiKey}`);
}

// 5. GEOLOCATION ON LOAD 
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

//6. EVENTS
searchBtn.addEventListener("click", () => checkWeather(searchBox.value));
searchBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkWeather(searchBox.value);
});