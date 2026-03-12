const apiKey = "29a9556d6506441debe7af208c3015cf";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

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
async function checkWeather(city) {
    if (!city.trim()) return;

    try {
        const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

        if (response.status === 404) {
            errorDiv.style.display = "flex";
            weatherDiv.style.display = "none";
            return;
        }

        const data = await response.json();

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

    } catch (error) {
        errorDiv.style.display = "flex";
        weatherDiv.style.display = "none";
    }
}

searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
});

searchBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkWeather(searchBox.value);
});