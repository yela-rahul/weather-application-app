// --- CONFIGURATION ---
const OPENWEATHER_API_KEY ="Your-OpenWeather-Key-Goes-Here"; //place your OpenWeatherMap API key her
const GEMINI_API_KEY =  "Your-Gemini-Key-Goes-Here"; // place your Gemini API key here

// --- ELEMENT SELECTORS ---
const splashScreen = document.getElementById('splashScreen');
const mainContent = document.getElementById('mainContent');
const searchForm = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const resultsContent = document.getElementById('resultsContent');
const loader = document.getElementById('loader');
const errorBox = document.getElementById('errorBox');
const weatherDetails = document.getElementById('weatherDetails');

// --- ICONS MAPPING ---
const weatherIcons = {
    "Clear": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 6.5A5.5 5.5 0 1017.5 12 5.506 5.506 0 0012 6.5zm0 9a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"/></svg>`,
    "Clouds": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 19h-11a5.5 5.5 0 01-5.46-6.41 6.5 6.5 0 0112.42-2.99A4.5 4.5 0 0117.5 19z"/></svg>`,
    "Rain": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 19h-11a5.5 5.5 0 01-5.46-6.41 6.5 6.5 0 0112.42-2.99A4.5 4.5 0 0117.5 19zm-8-3.5a.75.75 0 001.5 0v-2a.75.75 0 00-1.5 0v2zm4 0a.75.75 0 001.5 0v-2a.75.75 0 00-1.5 0v2z"/></svg>`,
    "Drizzle": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 19h-11a5.5 5.5 0 01-5.46-6.41 6.5 6.5 0 0112.42-2.99A4.5 4.5 0 0117.5 19zm-6-3.5a.75.75 0 001.5 0v-2a.75.75 0 00-1.5 0v2z"/></svg>`,
    "Thunderstorm": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.22 19.33a.75.75 0 001.06 1.06l4.25-4.25a.75.75 0 00-1.06-1.06l-4.25 4.25zM10.25 15a.75.75 0 01.75-.75h2.25a.75.75 0 01.53 1.28l-4.25 4.25a.75.75 0 01-1.06-1.06L10.25 15zM17.5 16a4.5 4.5 0 002.96-8.39 6.5 6.5 0 00-12.42-3 5.5 5.5 0 00-1 10.98h10.46z"/></svg>`,
    "Snow": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 19h-11a5.5 5.5 0 01-5.46-6.41 6.5 6.5 0 0112.42-2.99A4.5 4.5 0 0117.5 19zm-1.5-3.5h-2a.75.75 0 000 1.5h2a.75.75 0 000-1.5zm-5 0h-2a.75.75 0 000 1.5h2a.75.75 0 000-1.5zm2.5-3h-2a.75.75 0 000 1.5h2a.75.75 0 000-1.5z"/></svg>`,
    "Default": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M11.25 2.25a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5a.75.75 0 01.75-.75zm6.328 3.52a.75.75 0 01.53 1.28l-.353.354a.75.75 0 01-1.06-1.06l.353-.354a.75.75 0 01.53-.22zM20 12a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5a.75.75 0 01.75.75zM17.932 17.932a.75.75 0 11-1.06-1.06l.353-.354a.75.75 0 011.06 1.06l-.353.354zM12 20a.75.75 0 01-.75.75v.5a.75.75 0 011.5 0v-.5A.75.75 0 0112 20zM5.717 17.578a.75.75 0 01-1.06 1.06l-.353-.354a.75.75 0 111.06-1.06l.353.354zM4 12a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5A.75.75 0 014 12zM6.068 6.068a.75.75 0 011.06-1.06l-.354-.353a.75.75 0 11-1.06 1.06l.354.353z" clip-rule="evenodd" /></svg>`
};

// --- HELPER FUNCTIONS ---
const kelvinToCelsius = (k) => k - 273.15;
const kelvinToFahrenheit = (k) => (k - 273.15) * 9/5 + 32;

// --- API CALLS ---
async function fetchWeatherData(city) {
    if (OPENWEATHER_API_KEY === "YOUR_API_KEY") {
        showError("Please add your OpenWeatherMap API key to the script.");
        return;
    }
    showLoader();
    const currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}`;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${OPENWEATHER_API_KEY}`;

    try {
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherURL),
            fetch(forecastURL)
        ]);
        if (!currentWeatherResponse.ok || !forecastResponse.ok) {
            if (currentWeatherResponse.status === 404) throw new Error(`City '${city}' not found.`);
            if (currentWeatherResponse.status === 401) throw new Error(`Authentication failed. Check your OpenWeatherMap API key.`);
            throw new Error('Failed to fetch weather data.');
        }
        const currentData = await currentWeatherResponse.json();
        const forecastData = await forecastResponse.json();
        hideLoader();
        displayWeatherData(currentData, forecastData);
    } catch (error) {
        hideLoader();
        showError(error.message);
    }
}

async function getGeminiSuggestions(weatherData) {
    const geminiLoader = document.getElementById('geminiLoader');
    const geminiButton = document.getElementById('geminiButton');
    const geminiResult = document.getElementById('geminiResult');

    geminiLoader.classList.remove('hidden');
    geminiButton.classList.add('hidden');
    geminiResult.classList.add('hidden');

    const { name, weather, main, wind } = weatherData;
    const tempC = kelvinToCelsius(main.temp).toFixed(1);
    const condition = weather[0].description;

    const prompt = `The weather in ${name} is currently ${tempC}°C with ${condition} and wind speeds of ${wind.speed} m/s. Based on this, what would you recommend someone to wear, and what are two fun activity ideas? Keep the response friendly, concise, and use markdown for formatting.`;
    
    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
    };
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error('Failed to get suggestions from Gemini.');
        }
        const result = await response.json();
        
        if (result.candidates && result.candidates.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            let htmlText = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/(\r\n|\n|\r)/g, '<br>');
            geminiResult.innerHTML = htmlText;
        } else {
            throw new Error('Received an empty response from Gemini.');
        }

    } catch (error) {
        geminiResult.innerHTML = `<p style="color: #f87171;">${error.message}</p>`;
    } finally {
        geminiLoader.classList.add('hidden');
        geminiResult.classList.remove('hidden');
    }
}

// --- DOM MANIPULATION ---
function showLoader() {
    resultsContent.classList.remove('hidden');
    weatherDetails.innerHTML = '';
    errorBox.classList.add('hidden');
    loader.classList.remove('hidden');
}

function hideLoader() {
    loader.classList.add('hidden');
}

function showError(message) {
    resultsContent.classList.remove('hidden');
    weatherDetails.innerHTML = '';
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
}

function displayWeatherData(current, forecast) {
    errorBox.classList.add('hidden');
    weatherDetails.innerHTML = ''; 

    const currentTempC = kelvinToCelsius(current.main.temp);
    const currentTempF = kelvinToFahrenheit(current.main.temp);
    const condition = current.weather[0].main;
    const icon = weatherIcons[condition] || weatherIcons['Default'];
    
    const weatherHTML = `
        <div class="weather-card card-style fade-in">
            <h2>${current.name}, ${current.sys.country}</h2>
            <p class="date">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <div class="details-flex">
                <div class="icon-container">${icon}</div>
                <div>
                    <p class="temp-main">${currentTempC.toFixed(1)}°C</p>
                    <p class="temp-alt">${currentTempF.toFixed(1)}°F</p>
                    <p class="condition">${current.weather[0].description}</p>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-item"><p class="label">Humidity</p><p class="value">${current.main.humidity}%</p></div>
                <div class="stat-item"><p class="label">Wind Speed</p><p class="value">${current.wind.speed} m/s</p></div>
                <div class="stat-item pressure-stat"><p class="label">Pressure</p><p class="value">${current.main.pressure} hPa</p></div>
            </div>
        </div>

        <div class="gemini-card card-style fade-in">
            <h3>Personalized Suggestions</h3>
            <button id="geminiButton">
                ✨ Get AI Suggestions
            </button>
            <div id="geminiLoader" class="hidden">
                 <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
            <div id="geminiResult" class="hidden"></div>
        </div>

        <div class="forecast-container fade-in">
            <h3>3-Day Forecast</h3>
            <div class="forecast-grid">
                ${processForecast(forecast.list)}
            </div>
        </div>
    `;
    weatherDetails.innerHTML = weatherHTML;
    weatherDetails.classList.remove('hidden');

    document.getElementById('geminiButton').addEventListener('click', () => getGeminiSuggestions(current));
}

function processForecast(forecastList) {
    const dailyData = {};
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyData[date]) dailyData[date] = [];
        dailyData[date].push(item);
    });
    const today = new Date().toLocaleDateString();
    return Object.keys(dailyData).filter(date => date !== today).slice(0, 3).map(date => {
        const dayData = dailyData[date][0];
        const tempC = kelvinToCelsius(dayData.main.temp);
        const condition = dayData.weather[0].main;
        const icon = weatherIcons[condition] || weatherIcons['Default'];
        const formattedDate = new Date(dayData.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
        return `
            <div class="card-style forecast-card">
                <p class="day">${formattedDate}</p>
                <div class="icon-container">${icon}</div>
                <p class="temp">${tempC.toFixed(1)}°C</p>
                <p class="condition">${condition}</p>
            </div>`;
    }).join('');
}

// --- EVENT LISTENERS ---
window.addEventListener('load', () => {
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        splashScreen.style.visibility = 'hidden';
        mainContent.style.opacity = '1';
    }, 3000);
});

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) fetchWeatherData(city);
});
