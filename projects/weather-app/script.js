// Weather App - JavaScript
// Using Open-Meteo API (không cần API key)

const cityInput = document.getElementById('cityInput');
const weatherInfo = document.getElementById('weatherInfo');
const emptyState = document.getElementById('emptyState');
const error = document.getElementById('error');
const loading = document.getElementById('loading');

async function searchWeather() {
    const city = cityInput.value.trim();
    
    if (city === '') {
        showError('Vui lòng nhập tên thành phố');
        return;
    }

    showLoading();
    hideError();

    try {
        // Bước 1: Lấy tọa độ của thành phố
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=vi&format=json`
        );
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            showError('Không tìm thấy thành phố này');
            hideLoading();
            return;
        }

        const location = geoData.results[0];
        
        // Bước 2: Lấy dữ liệu thời tiết từ tọa độ
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code,relative_humidity_2m,apparent_temperature,wind_speed_10m,pressure_msl&timezone=auto`
        );
        const weatherData = await weatherResponse.json();

        if (!weatherData.current) {
            showError('Không thể lấy dữ liệu thời tiết');
            hideLoading();
            return;
        }

        displayWeather(location, weatherData.current);
        hideLoading();

    } catch (err) {
        console.error('Error:', err);
        showError('Có lỗi xảy ra. Vui lòng thử lại.');
        hideLoading();
    }
}

function displayWeather(location, current) {
    const description = getWeatherDescription(current.weather_code);
    
    document.getElementById('cityName').textContent = 
        `${location.name}${location.admin1 ? ', ' + location.admin1 : ''}${location.country ? ', ' + location.country : ''}`;
    document.getElementById('temperature').textContent = 
        `${Math.round(current.temperature_2m)}°C`;
    document.getElementById('description').textContent = description;
    document.getElementById('humidity').textContent = 
        `${current.relative_humidity_2m}%`;
    document.getElementById('windSpeed').textContent = 
        `${Math.round(current.wind_speed_10m)} km/h`;
    document.getElementById('pressure').textContent = 
        `${Math.round(current.pressure_msl)} hPa`;
    document.getElementById('feelsLike').textContent = 
        `${Math.round(current.apparent_temperature)}°C`;

    emptyState.style.display = 'none';
    weatherInfo.classList.add('show');
}

function getWeatherDescription(code) {
    // WMO Weather interpretation codes
    const descriptions = {
        0: 'Trời quang đãng',
        1: 'Hầu như trong sạch',
        2: 'Có mây thưa',
        3: 'Mây phủ trung bình',
        45: 'Sương mù',
        48: 'Sương mù giá',
        51: 'Mưa nhẹ',
        53: 'Mưa vừa',
        55: 'Mưa nặng',
        61: 'Mưa nhẹ',
        63: 'Mưa vừa',
        65: 'Mưa nặng',
        71: 'Tuyết nhẹ',
        73: 'Tuyết vừa',
        75: 'Tuyết nặng',
        80: 'Mưa nước',
        81: 'Mưa nước vừa',
        82: 'Mưa nước nặng',
        85: 'Tuyết nước nhẹ',
        86: 'Tuyết nước nặng',
        95: 'Giông với mưa',
        96: 'Giông với mưa đá nhẹ',
        99: 'Giông với mưa đá nặng',
    };
    
    return descriptions[code] || 'Thời tiết không xác định';
}

function showError(message) {
    error.textContent = message;
    error.classList.add('show');
    weatherInfo.classList.remove('show');
}

function hideError() {
    error.classList.remove('show');
}

function showLoading() {
    loading.classList.add('show');
}

function hideLoading() {
    loading.classList.remove('show');
}

// Allow Enter key to search
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});
