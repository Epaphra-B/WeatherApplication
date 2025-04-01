import config from './config.js';

// DOM Elements
const searchBar = document.getElementById('searchbar');
const searchButton = document.getElementById('search-button');
const locationsList = document.getElementById('locations-list');
const mapContainer = document.getElementById('map-container');
const loadingOverlay = document.querySelector('.loading-overlay');
const errorMessage = document.querySelector('.error-message');
const errorText = document.getElementById('error-text');
const themeToggle = document.querySelector('.theme-toggle');
const addLocationBtn = document.querySelector('.add-location-btn');

// Theme handling
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.innerHTML = savedTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';

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

// Load saved locations from localStorage
function loadSavedLocations() {
    const savedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
    return savedLocations;
}

// Save locations to localStorage
function saveLocations(locations) {
    localStorage.setItem('savedLocations', JSON.stringify(locations));
}

// Add a new location
async function addLocation(city) {
    try {
        const response = await fetch(`${config.weatherBaseUrl}?q=${city}&appid=${config.weatherApiKey}&units=metric`);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        
        const locations = loadSavedLocations();
        if (!locations.some(loc => loc.id === data.id)) {
            locations.push({
                id: data.id,
                name: data.name,
                country: data.sys.country,
                temp: data.main.temp,
                weather: data.weather[0].main,
                icon: data.weather[0].icon
            });
            saveLocations(locations);
            updateLocationsList();
        } else {
            showError('Location already saved');
        }
    } catch (error) {
        showError('City not found. Please try again.');
    }
}

// Remove a location
function removeLocation(id) {
    const locations = loadSavedLocations();
    const updatedLocations = locations.filter(loc => loc.id !== id);
    saveLocations(updatedLocations);
    updateLocationsList();
}

// Update the locations list display
function updateLocationsList() {
    const locations = loadSavedLocations();
    
    if (locations.length === 0) {
        locationsList.innerHTML = `
            <div class="no-locations">
                <i class="fas fa-map-marker-alt"></i>
                <p>No saved locations yet</p>
            </div>
        `;
        return;
    }

    locationsList.innerHTML = locations.map(location => `
        <div class="location-item">
            <div class="location-info">
                <div class="location-name">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${location.name}, ${location.country}</span>
                </div>
                <div class="location-weather">
                    <img src="https://openweathermap.org/img/wn/${location.icon}@2x.png" alt="Weather icon">
                    <span>${Math.round(location.temp)}°C</span>
                    <span class="weather-type">${location.weather}</span>
                </div>
            </div>
            <button class="remove-location" data-id="${location.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-location').forEach(button => {
        button.addEventListener('click', () => {
            removeLocation(button.dataset.id);
        });
    });
}

// Event listeners
searchBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submit();
    }
});

searchButton.addEventListener('click', submit);
addLocationBtn.addEventListener('click', () => {
    const city = searchBar.value.trim();
    if (city) {
        addLocation(city);
    } else {
        showError('Please enter a city name');
    }
});

async function submit() {
    const city = searchBar.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    showLoading();
    try {
        await addLocation(city);
    } finally {
        hideLoading();
    }
}

// Theme toggle
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.innerHTML = newTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateLocationsList();
}); 