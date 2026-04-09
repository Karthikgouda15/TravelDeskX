// /Users/karthikgouda/Desktop/TravelDesk/server/services/weatherService.js
const axios = require('axios');

/**
 * Service to fetch destination weather from OpenWeatherMap API.
 * Uses mock responses if API is missing.
 */
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Fetch current weather for a city
 * @param {string} city - Destination city name
 * @returns {object} - Weather data object (temp, humidity, condition)
 */
exports.getDestinationWeather = async (city) => {
  const apiKey = process.env.OPENWEATHER_API_KEY || 'mocked_weather_key';

  if (!apiKey || apiKey === 'mocked_weather_key') {
    return {
      success: true,
      data: {
        temp: 24, // Celsius
        feels_like: 26,
        humidity: 60,
        condition: 'Sunny',
        icon: '01d', // WeatherIcon
        city: city
      }
    };
  }

  // Real API implementation
  /*
  const response = await axios.get(API_URL, {
    params: {
      q: city,
      appid: apiKey,
      units: 'metric'
    }
  });

  const { main, weather } = response.data;
  return {
    success: true,
    data: {
      temp: Math.round(main.temp),
      feels_like: Math.round(main.feels_like),
      humidity: main.humidity,
      condition: weather[0].main,
      icon: weather[0].icon,
      city: city
    }
  };
  */
};
