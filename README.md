# Weather App

A minimal weather application built with HTML, CSS, and Vanilla JavaScript.  
Fetches real-time data from the OpenWeatherMap API and displays current conditions with an hourly forecast for any city.

**Live Demo:** [weather-app-zeta-two-36.vercel.app](https://weather-app-zeta-two-36.vercel.app)

---

## Screenshot

![Weather App](./assets/screenshot.png)

---

## Features

- Search weather by city name
- Today's hourly forecast with icons and temperature
- Real-time temperature, humidity, and wind speed
- Dynamic weather icons based on conditions
- Weather condition description
- Dark themed UI, responsive design
- Deployed on Vercel

---

## Planned

- Search by pressing Enter key
- Error messages for invalid city names
- Loading indicator while fetching data
- Save last searched city (Local Storage)
- Toggle Celsius / Fahrenheit
- Detect user location automatically
- Dark / Light mode toggle

---

## Tech Stack

- HTML5
- CSS3 (Flexbox)
- JavaScript (ES6)
- OpenWeatherMap API
- Vercel

---

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/karmabarca17/weather-app.git
   cd weather-app
   ```

2. Get a free API key at [openweathermap.org](https://openweathermap.org/api)

3. In `script.js`, replace the placeholder with your key:
   ```js
   const apiKey = "YOUR_API_KEY";
   ```

4. Open `index.html` in your browser, or use the Live Server extension in VS Code.

---

## Project Structure

```
weather-app/
├── assets/
│   └── screenshot.png
├── index.html
├── style.css
├── script.js
└── README.md
```

---

## License

MIT