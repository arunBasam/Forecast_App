const API_KEY = '7646700dc1492ba63e63b18ae25efaf7';

//  function to fetch weather data from OpenWeatherMap API
async function fetchWeatherData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw new Error('Failed to fetch weather data');
    }
}

//  function to get weather icon URL
function getWeatherIconUrl(icon) {
    return `http://openweathermap.org/img/wn/${icon}.png`;
}

// Function to display current weather based on fetched data
function displayCurrentWeather(data) {
    const currentWeatherDiv = document.getElementById('current-weather');
    currentWeatherDiv.classList.remove('hidden');
    currentWeatherDiv.innerHTML = `
        <h2 class="text-2xl font-bold mb-2 text-blue-500">${data.name}</h2>
        <p class="text-xl text-gray-700">${data.weather[0].description}</p>
        <p class="text-xl text-gray-700">Temperature: ${data.main.temp}°C</p>
        <p class="text-xl text-gray-700">Humidity: ${data.main.humidity}%</p>
        <p class="text-xl text-gray-700">Wind Speed: ${data.wind.speed} m/s</p>
        <img src="${getWeatherIconUrl(data.weather[0].icon)}" alt="${data.weather[0].description}" class="mt-4">
    `;
}

// Function to display extended 5-day forecast 
async function displayExtendedForecast(city) {
    try {
        // Fetch 5-day forecast data for the specified city
        const forecastData = await fetchWeatherData(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`);
        
        //  forecast container 
        const forecastDiv = document.getElementById('forecast');
        forecastDiv.classList.remove('hidden');
        forecastDiv.innerHTML = '<h2 class="text-2xl font-bold mb-4 text-blue-500">5-Day Forecast</h2>';
        
        //  To track daily forecasts
        const dailyForecasts = {};
        const today = new Date().getDate();

        // Iterate through each forecast data point
        forecastData.list.forEach(dataPoint => {
            // Get the date and day of the week for each forecast data point
            const date = new Date(dataPoint.dt * 1000);
            const day = date.getDate();
            const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

           
            if (day === today) return;

            //Forecast object for the current day if not already present
            if (!dailyForecasts[day]) {
                dailyForecasts[day] = {
                    date: formattedDate,
                    dayOfWeek: dayOfWeek,
                    icon: dataPoint.weather[0].icon,
                    temp: dataPoint.main.temp,
                    wind: dataPoint.wind.speed,
                    humidity: dataPoint.main.humidity
                };
            }
        });

        // Display each day's forecast 
        Object.values(dailyForecasts).forEach((dayData, index) => {
            if (index < 5) { 
                const iconUrl = getWeatherIconUrl(dayData.icon);

                
                const forecastItem = document.createElement('div');
                forecastItem.classList.add('flex', 'items-center', 'justify-between', 'mb-4', 'p-4', 'rounded-lg', 'shadow', `forecast-bg-${index}`);
                forecastItem.innerHTML = `
                    <div class="flex flex-col items-start">
                        <div class="text-lg font-semibold text-gray-700">${dayData.dayOfWeek}, ${dayData.date}</div>
                    </div>
                    <div class="flex flex-col items-center">
                        <img src="${iconUrl}" alt="${dayData.dayOfWeek}" class="w-10 h-10 mb-2">
                        <div class="text-lg font-semibold text-blue-500 bg-blue-100 p-2 rounded-md">${dayData.temp}°C</div>
                    </div>
                    <div class="flex flex-col items-center text-gray-600">
                        <div class="text-sm bg-teal-100 p-2 rounded-md">Wind: ${dayData.wind} m/s</div>
                        <div class="text-sm bg-orange-100 p-2 rounded-md">Humidity: ${dayData.humidity}%</div>
                    </div>
                `;
                forecastDiv.appendChild(forecastItem);
            }
        });
    } catch (error) {
        console.error('Error fetching extended forecast data:', error);
        alert('Could not fetch extended forecast data. Please try again.');
    }
}

// Function to handle city search
async function handleCitySearch() {
    const cityInput = document.getElementById('city-input').value.trim();
    if (cityInput) {
        try {
            const weatherData = await fetchWeatherData(`https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&units=metric&appid=${API_KEY}`);
            displayCurrentWeather(weatherData);
            displayExtendedForecast(cityInput);
        } catch (error) {
            alert('Could not fetch weather data. Please try again.');
        }
    } else {
        alert('Please enter a city name.');
    }
}

// Function to handle current location search
async function handleCurrentLocationSearch() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const weatherData = await fetchWeatherData(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
                displayCurrentWeather(weatherData);
                displayExtendedForecast(weatherData.name);
            } catch (error) {
                alert('Could not fetch weather data. Please try again.');
            }
        }, (error) => {
            alert('Unable to retrieve your location.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}
