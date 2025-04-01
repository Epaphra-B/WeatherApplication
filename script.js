import config from './config.js';

// Verify config is loaded correctly
console.log('Config loaded:', config);

// DOM Elements
const searchBar = document.getElementById('searchbar');
const searchButton = document.getElementById('search-button');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const description = document.getElementById('weather-description');
const forecastContainer = document.getElementById('forecast-container');
const loadingOverlay = document.querySelector('.loading-overlay');
const errorMessage = document.querySelector('.error-message');
const errorText = document.getElementById('error-text');
const themeToggle = document.querySelector('.theme-toggle');

// Global variables
let weatherChart;
let lastForecastData;

// Theme handling
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.innerHTML = savedTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';

// Function to update chart colors based on theme
function updateChartColors() {
    if (!weatherChart) return;
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#ffffff' : '#333333';
    
    weatherChart.options.scales.x.ticks.color = textColor;
    weatherChart.options.scales.y1.ticks.color = textColor;
    weatherChart.options.plugins.tooltip.backgroundColor = isDark ? '#2d2d2d' : '#ffffff';
    weatherChart.options.plugins.tooltip.titleColor = textColor;
    weatherChart.options.plugins.tooltip.bodyColor = textColor;
    weatherChart.options.plugins.tooltip.borderColor = isDark ? '#e0e0e0' : '#666666';
    
    weatherChart.update();
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.innerHTML = newTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    updateChartColors();
});

// Show/hide loading overlay
const showLoading = () => loadingOverlay.style.display = 'flex';
const hideLoading = () => loadingOverlay.style.display = 'none';

// Show error message
const showError = (message) => {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
};

// Get user's location
const getUserLocation = () => {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    showLoading();
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                console.log('Location coordinates:', { latitude, longitude });
                const weatherData = await getWeatherByCoords(latitude, longitude);
                console.log('Weather data received:', weatherData);
                await updateWeatherDisplay(weatherData);
            } catch (error) {
                console.error('Detailed error:', error);
                showError(`Error: ${error.message}`);
            } finally {
                hideLoading();
            }
        },
        (error) => {
            console.error('Geolocation error:', error);
            let errorMessage = 'Unable to get your location';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out.';
                    break;
                default:
                    errorMessage = 'An unknown error occurred while getting your location.';
            }
            showError(errorMessage);
            hideLoading();
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
};

// Event listeners
searchBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submit();
    }
});

searchButton.addEventListener('click', submit);

// Initialize with user's location
getUserLocation();

async function submit() {
    const city = searchBar.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    showLoading();
    try {
        const weatherData = await getWeatherData(city);
        await updateWeatherDisplay(weatherData);
    } catch (error) {
        showError('City not found. Please try again.');
    } finally {
        hideLoading();
    }
}

async function getWeatherData(city) {
    try {
        console.log('Fetching weather for city:', city);
        console.log('Using API key:', config.apiKey);
        const response = await fetch(`${config.weatherBaseUrl}?q=${city}&appid=${config.apiKey}&units=metric`);
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error response:', errorData);
            
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your API key configuration.');
            }
            throw new Error('Weather data not found');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

async function getWeatherByCoords(lat, lon) {
    try {
        console.log('Fetching weather for coordinates:', { lat, lon });
        console.log('Using API key:', config.apiKey);
        const response = await fetch(`${config.weatherBaseUrl}?lat=${lat}&lon=${lon}&appid=${config.apiKey}&units=metric`);
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error response:', errorData);
            
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your API key configuration.');
            } else if (response.status === 404) {
                throw new Error('Location not found. Please try a different location.');
            } else {
                throw new Error(`Weather data not found: ${errorData.message || 'Unknown error'}`);
            }
        }
        
        const data = await response.json();
        console.log('Weather data parsed successfully');
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

async function getForecast(city) {
    try {
        console.log('Fetching forecast for city:', city);
        console.log('Using API key:', config.apiKey);
        const response = await fetch(`${config.forecastBaseUrl}?q=${city}&appid=${config.apiKey}&units=metric`);
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error response:', errorData);
            
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your API key configuration.');
            }
            throw new Error('Forecast data not found');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        throw error;
    }
}

// Initialize chart
function initializeChart() {
    const ctx = document.getElementById('weatherGraph').getContext('2d');
    weatherChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: [],
                    borderColor: '#2196f3',
                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1',
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'var(--card-background)',
                    titleColor: 'var(--text-color)',
                    bodyColor: 'var(--text-color)',
                    borderColor: 'var(--text-secondary)',
                    borderWidth: 2,
                    padding: 15,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'var(--text-color)',
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        maxRotation: 45,
                        minRotation: 45,
                        callback: function(value, index, values) {
                            return index % 6 === 0 ? this.getLabelForValue(value) : '';
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'var(--text-color)',
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        padding: 5
                    }
                }
            }
        }
    });
}

// Update chart with new data
function updateChart(forecastData) {
    const now = new Date();
    const last24Hours = forecastData.list.filter(item => {
        const itemDate = new Date(item.dt * 1000);
        return itemDate >= new Date(now - 24 * 60 * 60 * 1000);
    });

    const labels = last24Hours.map(item => 
        new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: 'numeric',
            hour12: true 
        })
    );

    const temperatures = last24Hours.map(item => item.main.temp);

    weatherChart.data.labels = labels;
    weatherChart.data.datasets[0].data = temperatures;
    weatherChart.update();
}

// Load settings from localStorage
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {
        tempUnit: 'metric',
        windUnit: 'm/s',
        weatherAlerts: true,
        dailyForecast: true
    };
    return settings;
}

// Convert temperature based on unit
function convertTemperature(temp, fromUnit = 'metric', toUnit = 'metric') {
    if (fromUnit === toUnit) return temp;
    if (fromUnit === 'metric' && toUnit === 'imperial') {
        return (temp * 9/5) + 32;
    }
    if (fromUnit === 'imperial' && toUnit === 'metric') {
        return (temp - 32) * 5/9;
    }
    return temp;
}

// Convert wind speed based on unit
function convertWindSpeed(speed, fromUnit = 'm/s', toUnit = 'm/s') {
    if (fromUnit === toUnit) return speed;
    if (fromUnit === 'm/s' && toUnit === 'mph') {
        return speed * 2.237;
    }
    if (fromUnit === 'mph' && toUnit === 'm/s') {
        return speed / 2.237;
    }
    return speed;
}

// Listen for settings updates from other windows
window.addEventListener('storage', (e) => {
    if (e.key === 'settingsUpdated') {
        const currentCity = document.getElementById('city-name').textContent;
        if (currentCity !== 'Search for a city') {
            fetchWeatherData(currentCity);
        }
    } else if (e.key === 'themeUpdated') {
        document.documentElement.setAttribute('data-theme', e.newValue);
        themeToggle.innerHTML = e.newValue === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        updateChartColors();
    }
});

// Update forecast display with current settings
function updateForecast(forecastData) {
    const settings = loadSettings();
    const dailyForecasts = forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 5);
    
    forecastContainer.innerHTML = dailyForecasts.map(forecast => {
        const temp = convertTemperature(forecast.main.temp, 'metric', settings.tempUnit);
        return `
            <div class="forecast-item">
                <div class="forecast-date">${new Date(forecast.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="Weather icon">
                <div class="forecast-temp">${temp.toFixed(1)}°${settings.tempUnit === 'metric' ? 'C' : 'F'}</div>
                <div class="forecast-description">${forecast.weather[0].description}</div>
            </div>
        `;
    }).join('');
}

// Update weather display with current settings
async function updateWeatherDisplay(data) {
    const settings = loadSettings();
    
    // Update city name
    document.getElementById('city-name').textContent = data.name;
    
    // Update temperature
    const temp = convertTemperature(data.main.temp, 'metric', settings.tempUnit);
    document.getElementById('temperature').textContent = temp.toFixed(1);
    document.querySelector('.unit').textContent = settings.tempUnit === 'metric' ? '°C' : '°F';
    
    // Update wind speed
    const windSpeed = convertWindSpeed(data.wind.speed, 'm/s', settings.windUnit);
    document.getElementById('wind-speed').textContent = `${windSpeed.toFixed(1)} ${settings.windUnit}`;
    
    // Update other weather information
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    document.getElementById('weather-description').textContent = data.weather[0].description;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    
    // Update sunrise and sunset times
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('sunrise').textContent = sunrise;
    document.getElementById('sunset').textContent = sunset;
    
    // Update additional details
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById('clouds').textContent = `${data.clouds.all}%`;

    // Update date and time
    const now = new Date();
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('current-time').textContent = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: 'numeric',
        hour12: true 
    });

    // Update forecast and chart
    try {
        const forecastData = await getForecast(data.name);
        lastForecastData = forecastData; // Store for graph type switching
        updateForecast(forecastData);
        updateChart(forecastData);
    } catch (error) {
        console.error('Error fetching forecast:', error);
        showError('Unable to fetch forecast data. Please try again.');
    }
}

// Handle graph type switching
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.action-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const type = this.textContent.toLowerCase();
        if (weatherChart && lastForecastData) {
            const now = new Date();
            const last24Hours = lastForecastData.list.filter(item => {
                const itemDate = new Date(item.dt * 1000);
                return itemDate >= new Date(now - 24 * 60 * 60 * 1000);
            });

            const labels = last24Hours.map(item => 
                new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: 'numeric',
                    hour12: true 
                })
            );

            let data, label, color;
            switch(type) {
                case 'temperature':
                    data = last24Hours.map(item => item.main.temp);
                    label = 'Temperature (°C)';
                    color = '#2196f3';
                    break;
                case 'humidity':
                    data = last24Hours.map(item => item.main.humidity);
                    label = 'Humidity (%)';
                    color = '#4caf50';
                    break;
                case 'wind':
                    data = last24Hours.map(item => item.wind.speed);
                    label = 'Wind Speed (m/s)';
                    color = '#ff9800';
                    break;
            }

            weatherChart.data.labels = labels;
            weatherChart.data.datasets[0].data = data;
            weatherChart.data.datasets[0].label = label;
            weatherChart.data.datasets[0].borderColor = color;
            weatherChart.data.datasets[0].backgroundColor = color.replace(')', ', 0.2)');
            weatherChart.update();
        }
    });
});

// Initialize chart when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeChart();
    updateChartColors();
});

// Update graph with current settings
function updateGraph(forecastData) {
    const settings = loadSettings();
    const labels = forecastData.map(item => 
        new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
    
    const tempData = forecastData.map(item => 
        convertTemperature(item.main.temp, 'metric', settings.tempUnit)
    );
    
    const humidityData = forecastData.map(item => item.main.humidity);
    
    const windData = forecastData.map(item => 
        convertWindSpeed(item.wind.speed, 'm/s', settings.windUnit)
    );
    
    weatherChart.data.labels = labels;
    weatherChart.data.datasets[0].data = tempData;
    weatherChart.data.datasets[0].label = `Temperature (°${settings.tempUnit === 'metric' ? 'C' : 'F'})`;
    weatherChart.data.datasets[1].data = humidityData;
    weatherChart.data.datasets[2].data = windData;
    weatherChart.data.datasets[2].label = `Wind Speed (${settings.windUnit})`;
    weatherChart.update();
}

// Listen for settings updates from other pages
window.addEventListener('message', (event) => {
    if (event.data.type === 'settingsUpdated') {
        const currentCity = document.getElementById('city-name').textContent;
        if (currentCity !== 'Search for a city') {
            fetchWeatherData(currentCity);
        }
    } else if (event.data.type === 'themeUpdated') {
        document.documentElement.setAttribute('data-theme', event.data.theme);
        updateChartColors();
    }
});



