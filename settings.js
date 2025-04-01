import config from './config.js';

// Verify config is loaded correctly
console.log('Config loaded in settings:', config);

// DOM Elements
const searchBar = document.getElementById('searchbar');
const searchButton = document.getElementById('search-button');
const loadingOverlay = document.querySelector('.loading-overlay');
const errorMessage = document.querySelector('.error-message');
const themeToggle = document.querySelector('.theme-toggle');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const tempUnitSelect = document.getElementById('temp-unit');
const windUnitSelect = document.getElementById('wind-unit');
const weatherAlertsToggle = document.getElementById('weather-alerts');
const dailyForecastToggle = document.getElementById('daily-forecast');
const clearLocationsBtn = document.getElementById('clear-locations');

// Theme handling
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
darkModeToggle.checked = savedTheme === 'dark';
themeToggle.innerHTML = savedTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';

// Loading overlay functions
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Error message display
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'flex';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Load settings from localStorage
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {
        tempUnit: 'metric',
        windUnit: 'm/s',
        weatherAlerts: true,
        dailyForecast: true
    };

    tempUnitSelect.value = settings.tempUnit;
    windUnitSelect.value = settings.windUnit;
    weatherAlertsToggle.checked = settings.weatherAlerts;
    dailyForecastToggle.checked = settings.dailyForecast;
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        tempUnit: tempUnitSelect.value,
        windUnit: windUnitSelect.value,
        weatherAlerts: weatherAlertsToggle.checked,
        dailyForecast: dailyForecastToggle.checked
    };

    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Broadcast settings update to all open windows
    window.localStorage.setItem('settingsUpdated', Date.now().toString());
}

// Event Listeners
searchBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchBar.value.trim();
        if (city) {
            window.location.href = `index.html?city=${encodeURIComponent(city)}`;
        }
    }
});

searchButton.addEventListener('click', () => {
    const city = searchBar.value.trim();
    if (city) {
        window.location.href = `index.html?city=${encodeURIComponent(city)}`;
    }
});

// Theme toggle
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    darkModeToggle.checked = newTheme === 'dark';
    themeToggle.innerHTML = newTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    
    // Broadcast theme update
    window.localStorage.setItem('themeUpdated', newTheme);
});

// Settings change handlers
function handleSettingChange(event) {
    const settings = {
        tempUnit: tempUnitSelect.value,
        windUnit: windUnitSelect.value,
        weatherAlerts: weatherAlertsToggle.checked,
        dailyForecast: dailyForecastToggle.checked
    };

    // Save settings
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // Broadcast settings update
    window.localStorage.setItem('settingsUpdated', Date.now().toString());
}

// Event Listeners for settings changes
tempUnitSelect.addEventListener('change', handleSettingChange);
windUnitSelect.addEventListener('change', handleSettingChange);
weatherAlertsToggle.addEventListener('change', handleSettingChange);
dailyForecastToggle.addEventListener('change', handleSettingChange);

// Clear locations
clearLocationsBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all saved locations? This action cannot be undone.')) {
        showLoading();
        localStorage.removeItem('savedLocations');
        setTimeout(() => {
            hideLoading();
            showError('All saved locations have been cleared.');
        }, 1000);
    }
});

// Listen for settings updates from other windows
window.addEventListener('storage', (e) => {
    if (e.key === 'settingsUpdated') {
        loadSettings();
    } else if (e.key === 'themeUpdated') {
        document.documentElement.setAttribute('data-theme', e.newValue);
        darkModeToggle.checked = e.newValue === 'dark';
        themeToggle.innerHTML = e.newValue === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }
});

// Initialize settings on page load
document.addEventListener('DOMContentLoaded', () => {
    const settings = JSON.parse(localStorage.getItem('settings')) || {
        tempUnit: 'metric',
        windUnit: 'm/s',
        weatherAlerts: true,
        dailyForecast: true
    };
    
    tempUnitSelect.value = settings.tempUnit;
    windUnitSelect.value = settings.windUnit;
    weatherAlertsToggle.checked = settings.weatherAlerts;
    dailyForecastToggle.checked = settings.dailyForecast;
}); 