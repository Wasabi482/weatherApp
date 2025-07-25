const apiKey = '052068475596b39892497b13db206954';
const weatherSection = document.getElementById('weather');

const iconMap = {
  Rain: 'images/rain.png',
  Clear: 'images/sunny.png',
  Clouds: 'images/cloud.png',
  Thunderstorm: 'images/thunderstorm.png',
};

const bgMap = {
  Rain: 'images/rain.mp4',
  Clear: 'images/sunny.mp4',
  Clouds: 'images/clouds.mp4',
  Thunderstorm: 'images/thunderstorm.mp4'
};

let lastCondition = '';
let weatherInterval = null;

function setBackgroundVideo(condition) {
  if (condition !== lastCondition) {
    const video = document.getElementById('bg-video');
    const source = video.querySelector('source');
    source.src = bgMap[condition] || bgMap['Clear'];
    video.load();
    video.play();
    lastCondition = condition;
  }
}

async function getWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Weather data could not be fetched.");
    }
    const data = await response.json();

    const city = data.name;
    const temp = data.main.temp;
    const maxTemp = data.main.temp_max;
    const minTemp = data.main.temp_min;
    const description = data.weather[0].description;
    const name = data.weather[0].main;
    const iconUrl = iconMap[name] || `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    const feelsLike = data.main.feels_like;
    const humidity = data.main.humidity;
    const wind = data.wind.speed;
    const clouds = data.clouds.all;

    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit'
    });
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit'
    });

    const timestamp = data.dt;
    const dateObj = new Date(timestamp * 1000);
    const dateStr = dateObj.toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const timeStr = dateObj.toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit'
    });

    weatherSection.innerHTML = `
    <main class="main">
      <section class="weatherSection">
        <h2>Weather in ${city}</h2>
        <p>${dateStr} ${timeStr}</p>
        <p class="description">${description}</p>
        <p class="temp">${temp.toFixed(0)}°</p> 
        <p><img src="${iconUrl}" class="weatherIcon" alt="${description}"></p> 
      </section>

      <section class="detailsSection">
        <table class="details">
          <tr><th>Min Temp</th><td>${minTemp}°C</td></tr>
          <tr><th>Max Temp</th><td>${maxTemp}°C</td></tr>
          <tr><th>Feels Like</th><td>${feelsLike}°C</td></tr>
          <tr><th>Humidity</th><td>${humidity}%</td></tr>
          <tr><th>Wind</th><td>${(wind * 3.6).toFixed(1)} km/h</td></tr>
          <tr><th>Cloud</th><td>${clouds}%</td></tr>
          <tr><th>Sunrise</th><td>${sunrise}</td></tr>
          <tr><th>Sunset</th><td>${sunset}</td></tr>
        </table>
      </section>
    </main>
    `;

    setBackgroundVideo(name);

    if (!weatherInterval) {
      weatherInterval = setInterval(() => {
        getWeather(lat, lon);
      }, 600000); // 10 minutes
    }

  } catch (error) {
    weatherSection.innerHTML = "Error fetching weather data.";
    console.error(error);
  }
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        getWeather(latitude, longitude);
      },
      error => {
        weatherSection.innerHTML = "Location access denied.";
      }
    );
  } else {
    weatherSection.innerHTML = "Geolocation not supported.";
  }
}

getLocation();
