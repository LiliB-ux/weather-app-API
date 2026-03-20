const apiKey = "f6891a3caf45deb31a2934a1ebd7f840";

const cityInput = document.getElementById("city-input");
const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const errorMessage = document.getElementById("error-message");
const loadingMessage = document.getElementById("loading-message");
const weatherResult = document.getElementById("weather-result");
const weatherIcon = document.getElementById("weather-icon");
const forecastSection = document.getElementById("forecast-section");
const forecastContainer = document.getElementById("forecast-container");

async function getWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    showError("Please enter a city.");
    return;
  }

  loadingMessage.textContent = "Loading weather...";
  errorMessage.textContent = "";
  weatherResult.classList.add("hidden");
  forecastSection.classList.add("hidden");

  try {
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );

    if (!currentResponse.ok) {
      throw new Error("City not found");
    }

    const currentData = await currentResponse.json();
    displayWeather(currentData);

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );

    if (!forecastResponse.ok) {
      throw new Error("Forecast not available");
    }

    const forecastData = await forecastResponse.json();
    displayForecast(forecastData);
  } catch (error) {
    showError(error.message);
  } finally {
    loadingMessage.textContent = "";
  }
}

async function getLocationWeather() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }

  loadingMessage.textContent = "Getting your location...";
  errorMessage.textContent = "";
  weatherResult.classList.add("hidden");
  forecastSection.classList.add("hidden");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );

        if (!currentResponse.ok) {
          throw new Error("Unable to get weather for your location");
        }

        const currentData = await currentResponse.json();
        displayWeather(currentData);

        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );

        if (!forecastResponse.ok) {
          throw new Error("Forecast not available");
        }

        const forecastData = await forecastResponse.json();
        displayForecast(forecastData);
      } catch (error) {
        showError(error.message);
      } finally {
        loadingMessage.textContent = "";
      }
    },
    () => {
      loadingMessage.textContent = "";
      showError("Location access was denied.");
    }
  );
}

function displayWeather(data) {
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  temperature.textContent = `Temperature: ${data.main.temp}°C`;
  description.textContent = `Weather: ${data.weather[0].description}`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  wind.textContent = `Wind Speed: ${data.wind.speed} m/s`;

  const iconCode = data.weather[0].icon;
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIcon.style.display = "block";

  errorMessage.textContent = "";
  weatherResult.classList.remove("hidden");
}

function displayForecast(data) {
  forecastContainer.innerHTML = "";

  const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

  dailyForecasts.slice(0, 5).forEach(day => {
    const date = new Date(day.dt_txt);
    const dayName = date.toLocaleDateString("en-AU", { weekday: "short" });
    const iconCode = day.weather[0].icon;

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <div class="forecast-day">${dayName}</div>
      <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather icon">
      <div>${day.weather[0].main}</div>
      <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
    `;

    forecastContainer.appendChild(card);
  });

  forecastSection.classList.remove("hidden");
}

function showError(message) {
  errorMessage.textContent = message;
  loadingMessage.textContent = "";
  weatherResult.classList.add("hidden");
  forecastSection.classList.add("hidden");
}

cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    getWeather();
  }
});
