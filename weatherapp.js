document.getElementById('searchButton').addEventListener('click', fetchWeather);
document.getElementById('toggleOverlayButton').addEventListener('click', toggleOverlay);

let map; 
let tempOverlay; 
let tempActive = false;

function getCardinalDirection(degree) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degree / 45) % 8;
    return directions[index];
}

async function fetchWeather() {
    const city = document.getElementById('cityInput').value;
    if (city.trim() === '') {
        document.getElementById('weatherDisplay').innerHTML = '<p>Please enter a city name.</p>';
        return;
    }
    const apiKey = '800e3e1cdefd7f3bed124cc24665b0bf';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        displayWeather(data);
        displayMap(data.coord.lat, data.coord.lon);
    } catch (error) {
        document.getElementById('weatherDisplay').innerHTML = `<p>${error.message}</p>`;
    }
}

function displayWeather(data) {
    const weatherDisplay = document.getElementById('weatherDisplay');
    const temperature = data.main.temp;
    const windSpeed = data.wind.speed + " m/s";
    const windDirection = getCardinalDirection(data.wind.deg);
    const humidity = data.main.humidity;
    const description = data.weather[0].description;
    const icon = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

    weatherDisplay.innerHTML = `
        <h2>Weather in ${data.name}</h2>
        <img src="${icon}" alt="${description}">
        <p>Temperature: ${temperature}°C</p>
        <p>Wind Speed: ${windSpeed}</P>
        <p>Wind Direction: ${windDirection}</p>
        <p>Humidity: ${humidity}%</p>
        <p>Condition: ${description}</p>
    `;
}


function createLegend() {
    const legend = document.createElement('div');
    legend.setAttribute('id', 'legend');
    const legendHtml = `
    <div class="legend">
        <div><span style="background-color: rgb(90, 0, 110);"></span>-65 to -40°C</div>
        <div><span style="background-color: rgb(110, 45, 190);"></span>-40 to -30°C</div>
        <div><span style="background-color: rgb(0, 100, 200);"></span>-30 to -10°C</div>
        <div><span style="background-color: rgb(0, 200, 200);"></span>-10 to 10°C</div>
        <div><span style="background-color: rgb(150, 230, 0);"></span>10 to 25°C</div>
        <div><span style="background-color: rgb(240, 80, 0);"></span>25 to 30°C</div>
    </div>
    `;
    legend.innerHTML = legendHtml;
    document.body.appendChild(legend);
}

function displayMap(lat, lon) {
    const apiKey = '800e3e1cdefd7f3bed124cc24665b0bf';

    if (!map) {
        map = L.map('map').setView([lat, lon], 8);
    } else {
        map.setView([lat, lon], 8);
    }

    L.tileLayer(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const weatherOverlayUrl = `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`;
    tempOverlay = L.tileLayer(weatherOverlayUrl, {
        attribution: '&copy; OpenWeatherMap',
        opacity: 0.8
    });

    L.marker([lat, lon]).addTo(map)
        .bindPopup('Weather data location')
        .openPopup();
}

function toggleOverlay() {
    if (tempActive) {
        map.removeLayer(tempOverlay);
        tempActive = false;
        document.getElementById('toggleOverlayButton').textContent = 'Temp On';
    } else {
        tempOverlay.addTo(map);
        tempActive = true;
        document.getElementById('toggleOverlayButton').textContent = 'Temp Off';
        createLegend();
    }
}


