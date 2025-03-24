# Simple Weather App

A modern, responsive weather application that displays real-time weather information for any city.

## Features

- Real-time weather data from OpenWeatherMap API
- Responsive design for all devices
- Beautiful animations and transitions
- Clean and modern UI
- Mobile-friendly interface

## Prerequisites

- Python 3.8 or higher
- OpenWeatherMap API key

## Setup

1. Clone the repository:
```bash
git clone <your-repository-url>
cd SimpleWeatherApp
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up your API keys:
   - Copy `config.template.js` to `config.js`
   - Replace `YOUR_WEATHER_API_KEY` with your actual OpenWeatherMap API key

4. Start the development server:
```bash
python -m http.server 8000
```

5. Open your browser and navigate to:
```
http://localhost:8000
```

## Project Structure

```
SimpleWeatherApp/
├── assets/
│   └── amazon_rainforest.jpg
├── config.js
├── config.template.js
├── index.html
├── script.js
├── styles.css
├── requirements.txt
└── README.md
```

## Development

- The app uses vanilla JavaScript with ES6 modules
- CSS animations and transitions for smooth user experience
- Responsive design with mobile-first approach
- No external CSS frameworks required

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenWeatherMap API for weather data
- Poppins font from Google Fonts 