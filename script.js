import config from './config.js';

const searchBar = document.getElementById('searchbar');
const searchButton = document.getElementById('search-button');
const temperaturePanel = document.querySelector('.temperature-panel');
const humidityPanel = document.querySelector('.humidity-panel');
const pressurePanel = document.querySelector('.pressure-panel');
const descriptionPanel = document.querySelector('.description-panel');

// Add event listeners for both search bar and button
searchBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submit();
    }
});

searchButton.addEventListener('click', submit);

async function submit() {
    const city = searchBar.value;
    if (!city) return;

    // Add loading state
    temperaturePanel.classList.add('loading');
    humidityPanel.classList.add('loading');
    pressurePanel.classList.add('loading');
    descriptionPanel.classList.add('loading');

    try {
        const weatherData = await getWeatherData(city);
        updateWeatherDisplay(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Error fetching weather data. Please try again.');
    } finally {
        // Remove loading state
        temperaturePanel.classList.remove('loading');
        humidityPanel.classList.remove('loading');
        pressurePanel.classList.remove('loading');
        descriptionPanel.classList.remove('loading');
    }
}

async function getWeatherData(city) {
    const response = await fetch(`${config.weatherBaseUrl}?q=${city}&appid=${config.weatherApiKey}&units=metric`);
    if (!response.ok) {
        throw new Error('Weather data not found');
    }
    return await response.json();
}

function updateWeatherDisplay(data) {
    temperaturePanel.textContent = `${Math.round(data.main.temp)}°C`;
    humidityPanel.textContent = `Humidity: ${data.main.humidity}%`;
    pressurePanel.textContent = `Pressure: ${data.main.pressure} hPa`;
    descriptionPanel.textContent = data.weather[0].description;
}



