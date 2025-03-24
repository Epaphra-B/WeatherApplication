import requests

# Replace 'your_api_key' with your actual API key
api_key = 'xxxxxx'
base_url = 'http://api.openweathermap.org/data/2.5/weather?'

# City for which you want to get the weather
city_name = 'London'

# Complete URL
complete_url = base_url + 'q=' + city_name + '&appid=' + api_key

# Get the response from the URL
response = requests.get(complete_url)

# Convert the response to JSON format
weather_data = response.json()

# Check if the city is found
if weather_data['cod'] != '404':
    main = weather_data['main']
    weather = weather_data['weather'][0]
    
    # Extracting temperature, pressure, humidity, and weather description
    temperature = main['temp']
    pressure = main['pressure']
    humidity = main['humidity']
    weather_description = weather['description']
    
    # Print the weather details
    print(f"Temperature: {temperature}")
    print(f"Pressure: {pressure}")
    print(f"Humidity: {humidity}")
    print(f"Weather description: {weather_description}")
else:
    print("City Not Found!")


