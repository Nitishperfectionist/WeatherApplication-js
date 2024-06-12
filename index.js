document.addEventListener("DOMContentLoaded", function () {
    const cityInput = document.querySelector(".city-input");
    const searchButton = document.querySelector(".search-btn");
    const locationButton = document.querySelector(".location-btn");
    const currentWeatherDiv = document.querySelector(".current-weather");
    const weatherCardsDiv = document.querySelector(".weather-cards");
    const themeToggleButton = document.querySelector(".theme-toggle");
    const timeDisplay = document.getElementById("time");
    const toast = document.getElementById("toast");
    const loadingIndicator = document.getElementById("loading-spinner");

    const API_KEY = "b805b831fca2c80a1e9f1a5efb348e44";

    const createWeatherCard = (cityName, weatherItem, index) => {
        if (index === 0) {
            return `
                <div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} m/s</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
        } else {
            return `
                <li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
        }
    };

    const getWeatherDetails = (cityName, latitude, longitude) => {
        const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

        showLoading();
        fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });

            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            fiveDaysForecast.forEach((weatherItem, index) => {
                const html = createWeatherCard(cityName, weatherItem, index);
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", html);
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", html);
                }
            });
            hideLoading();
        }).catch(() => {
            hideLoading();
            showToast("An error occurred while fetching the weather forecast!");
        });
    };

    const getCityCoordinates = () => {
        const cityName = cityInput.value.trim();
        if (cityName === "") return;
        const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

        showLoading();
        fetch(API_URL).then(response => response.json()).then(data => {
            if (!data.length) {
                hideLoading();
                return showToast(`No coordinates found for ${cityName}`);
            }
            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
        }).catch(() => {
            hideLoading();
            showToast("An error occurred while fetching the coordinates!");
        });
    };

    const getUserCoordinates = () => {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
                showLoading();
                fetch(API_URL).then(response => response.json()).then(data => {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                }).catch(() => {
                    hideLoading();
                    showToast("An error occurred while fetching the city name!");
                });
            },
            error => {
                if (error.code === error.PERMISSION_DENIED) {
                    showToast("Geolocation request denied. Please reset location permission to grant access again.");
                } else {
                    showToast("Geolocation request error. Please reset location permission.");
                }
            }
        );
    };

    const toggleTheme = () => {
        document.body.classList.toggle("dark");
    };

    const showToast = (message) => {
        toast.innerText = message;
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 5000);
    };

    const showLoading = () => {
        document.body.classList.add("loading");
        loadingIndicator.style.display = "block";
    };

    const hideLoading = () => {
        document.body.classList.remove("loading");
        loadingIndicator.style.display = "none";
    };

    const updateTime = () => {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString();
        timeDisplay.innerText = formattedTime;
    };

    const initDefaultCity = () => {
        const defaultCity = "Sasaram";
        const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${defaultCity}&limit=1&appid=${API_KEY}`;

        fetch(API_URL).then(response => response.json()).then(data => {
            if (!data.length) return showToast(`No coordinates found for ${defaultCity}`);
            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
        }).catch(() => {
            showToast("An error occurred while fetching the coordinates for the default city!");
        });
    };

    locationButton.addEventListener("click", getUserCoordinates);
    searchButton.addEventListener("click", getCityCoordinates);
    cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
    themeToggleButton.addEventListener("click", toggleTheme);

    setInterval(updateTime, 1000);

    initDefaultCity(); // Initialize the weather for the default city on load
});
