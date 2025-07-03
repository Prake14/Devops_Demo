// script.js - Home Automation Dashboard Controller

// DOM Elements
const currentTimeElement = document.getElementById('currentTime');
const outsideTempElement = document.getElementById('outsideTemp');
const outsideHumidityElement = document.getElementById('outsideHumidity');
const notificationsContainer = document.getElementById('notifications');

// Global Variables
let environmentChart;
let energyChart;
let homeData = {};

// Initialize Application
document.addEventListener('DOMContentLoaded', async function() {
    await loadHomeData();
    initializeClock();
    initializeWeather();
    initializeEnvironmentChart();
    initializeEnergyChart();
    setupDeviceControls();
    setupSecuritySystem();
    simulateSensorEvents();
    showWelcomeNotification();
});

// Data Loading
async function loadHomeData() {
    try {
        const response = await fetch('data.json');
        homeData = await response.json();
        
        // Initialize device states from loaded data
        initializeDeviceStates();
        
    } catch (error) {
        console.error('Error loading home data:', error);
        showNotification('Failed to load home data', 'error');
        
        // Fallback to default data
        homeData = getDefaultData();
    }
}

function getDefaultData() {
    return {
        environment: {
            timestamps: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
            temperatures: [21.5, 21.3, 21.0, 20.8, 20.5, 20.3, 20.5, 21.0, 22.0, 23.5, 24.8, 25.5, 26.0, 26.2, 26.0, 25.5, 24.8, 24.0, 23.2, 22.5, 22.0, 21.8, 21.5, 21.3],
            humidities: [52, 53, 54, 55, 56, 57, 55, 52, 48, 45, 42, 40, 38, 37, 38, 40, 43, 46, 49, 51, 52, 53, 52, 52]
        },
        energy: {
            daily: [2.1, 2.3, 2.0, 2.4, 3.1, 4.2, 3.8],
            weekly: [18.5, 17.8, 19.2, 20.1, 22.3, 24.5, 21.8],
            monthly: [95, 92, 88, 85, 90, 105, 110, 115, 108, 102]
        },
        devices: {
            spotlight1: { state: "off", brightness: 0 },
            spotlight2: { state: "off", brightness: 0 },
            fan: { state: "off", speed: 0 },
            thermostat: { state: "off", temperature: 22, mode: "cool" }
        },
        security: {
            mode: "off",
            sensors: {
                front_door: "closed",
                living_room_window: "closed"
            }
        },
        weather: {
            temperature: 24,
            humidity: 45,
            conditions: "sunny"
        }
    };
}

function initializeDeviceStates() {
    // Set initial states from loaded data
    setDeviceState('spotlight1', homeData.devices.spotlight1.state, homeData.devices.spotlight1.brightness);
    setDeviceState('spotlight2', homeData.devices.spotlight2.state, homeData.devices.spotlight2.brightness);
    setDeviceState('fan', homeData.devices.fan.state, homeData.devices.fan.speed);
    setThermostatState(homeData.devices.thermostat.state, homeData.devices.thermostat.temperature);
    
    // Set security mode
    document.getElementById('securityMode').value = homeData.security.mode;
}

// Clock Functionality
function initializeClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    currentTimeElement.textContent = `${dateString} • ${timeString}`;
}

// Weather Functionality
function initializeWeather() {
    updateWeatherDisplay();
    setInterval(updateWeatherData, 600000); // Update every 10 minutes
}

function updateWeatherDisplay() {
    outsideTempElement.textContent = `${homeData.weather.temperature}°C`;
    outsideHumidityElement.textContent = `${homeData.weather.humidity}%`;
    
    const weatherIcon = document.querySelector('.weather-info i');
    switch(homeData.weather.conditions) {
        case 'sunny': weatherIcon.className = 'fas fa-sun'; break;
        case 'cloudy': weatherIcon.className = 'fas fa-cloud'; break;
        case 'rainy': weatherIcon.className = 'fas fa-cloud-rain'; break;
        default: weatherIcon.className = 'fas fa-sun';
    }
}

function updateWeatherData() {
    // Simulate small weather changes
    homeData.weather.temperature += (Math.random() * 2 - 1);
    homeData.weather.humidity += (Math.random() * 4 - 2);
    
    // Keep within reasonable bounds
    homeData.weather.temperature = Math.max(15, Math.min(35, homeData.weather.temperature));
    homeData.weather.humidity = Math.max(30, Math.min(80, homeData.weather.humidity));
    
    updateWeatherDisplay();
}

// Chart Initialization
function initializeEnvironmentChart() {
    const ctx = document.getElementById('environmentChart').getContext('2d');
    
    environmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: homeData.environment.timestamps,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: homeData.environment.temperatures,
                    borderColor: '#ff6384',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    yAxisID: 'y'
                },
                {
                    label: 'Humidity (%)',
                    data: homeData.environment.humidities,
                    borderColor: '#36a2eb',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: getEnvironmentChartOptions()
    });
    
    setupChartControls();
}

function getEnvironmentChartOptions() {
    return {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y}`;
                    }
                }
            }
        },
        scales: {
            x: { grid: { display: false } },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: { display: true, text: 'Temperature (°C)' }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { drawOnChartArea: false },
                title: { display: true, text: 'Humidity (%)' },
                min: 0,
                max: 100
            }
        }
    };
}

function initializeEnergyChart() {
    const ctx = document.getElementById('energyChart').getContext('2d');
    
    energyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Energy Usage (kWh)',
                data: homeData.energy.weekly,
                backgroundColor: '#4a90e2',
                borderColor: '#2354b7',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'kWh'
                    }
                }
            }
        }
    });
}

function setupChartControls() {
    document.querySelectorAll('.chart-range-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.chart-range-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // In a real app, this would fetch new data based on the time range
            showNotification(`Showing data for last ${this.dataset.range}`, 'info');
            
            // Simulate data change
            if (this.dataset.range === '7d') {
                energyChart.data.datasets[0].data = homeData.energy.weekly;
                energyChart.update();
            } else if (this.dataset.range === '30d') {
                // For demo, just show monthly data (first 7 days)
                energyChart.data.datasets[0].data = homeData.energy.monthly.slice(0, 7);
                energyChart.update();
            }
        });
    });
}

// Device Controls
function setupDeviceControls() {
    setupToggleButtons();
    setupBrightnessSliders();
    setupFanControls();
    setupThermostatControls();
}

function setupToggleButtons() {
    document.querySelectorAll('.toggle-btn').forEach(button => {
        button.addEventListener('click', function() {
            const deviceElement = this.closest('.device');
            const deviceId = deviceElement.dataset.device;
            
            // Toggle state
            const newState = homeData.devices[deviceId].state === 'on' ? 'off' : 'on';
            setDeviceState(deviceId, newState);
            
            showNotification(`${deviceId} turned ${newState}`, 'success');
        });
    });
}

function setupBrightnessSliders() {
    document.querySelectorAll('.brightness-slider').forEach(slider => {
        const deviceId = slider.id.split('-')[0];
        const valueDisplay = slider.nextElementSibling;
        
        slider.addEventListener('input', function() {
            const brightness = parseInt(this.value);
            homeData.devices[deviceId].brightness = brightness;
            
            valueDisplay.textContent = `${brightness}%`;
            updateDevicePowerUsage(deviceId);
            
            // Auto-toggle if brightness > 0
            if (brightness > 0 && homeData.devices[deviceId].state === 'off') {
                setDeviceState(deviceId, 'on', brightness);
            } else if (brightness === 0 && homeData.devices[deviceId].state === 'on') {
                setDeviceState(deviceId, 'off', 0);
            }
            
            if (brightness % 25 === 0) {
                showNotification(`${deviceId} brightness set to ${brightness}%`, 'info');
            }
        });
    });
}

function setupFanControls() {
    const fanSlider = document.getElementById('fan-speed');
    const fanSpeedDisplay = fanSlider.nextElementSibling;
    const speedLabels = ['Off', 'Low', 'Medium', 'High'];
    
    fanSlider.addEventListener('input', function() {
        const speed = parseInt(this.value);
        homeData.devices.fan.speed = speed;
        
        fanSpeedDisplay.textContent = speedLabels[speed];
        updateDevicePowerUsage('fan');
        
        // Auto-toggle based on speed
        if (speed > 0 && homeData.devices.fan.state === 'off') {
            setDeviceState('fan', 'on', speed);
        } else if (speed === 0 && homeData.devices.fan.state === 'on') {
            setDeviceState('fan', 'off', 0);
        }
        
        showNotification(`Fan speed set to ${speedLabels[speed]}`, 'info');
    });
}

function setupThermostatControls() {
    document.getElementById('temp-up').addEventListener('click', function() {
        const currentTemp = homeData.devices.thermostat.temperature;
        if (currentTemp < 30) {
            setThermostatState(homeData.devices.thermostat.state, currentTemp + 1);
            showNotification(`Temperature set to ${currentTemp + 1}°C`, 'info');
        }
    });
    
    document.getElementById('temp-down').addEventListener('click', function() {
        const currentTemp = homeData.devices.thermostat.temperature;
        if (currentTemp > 16) {
            setThermostatState(homeData.devices.thermostat.state, currentTemp - 1);
            showNotification(`Temperature set to ${currentTemp - 1}°C`, 'info');
        }
    });
}

function setDeviceState(deviceId, state, value = null) {
    const deviceElement = document.querySelector(`[data-device="${deviceId}"]`);
    const button = deviceElement.querySelector('.toggle-btn');
    const statusText = deviceElement.querySelector('.status');
    const icon = deviceElement.querySelector('.device-icon i');
    
    // Update data model
    homeData.devices[deviceId].state = state;
    if (value !== null) {
        if (deviceId === 'fan') {
            homeData.devices[deviceId].speed = value;
        } else if (deviceId.includes('spotlight')) {
            homeData.devices[deviceId].brightness = value;
        }
    }
    
    // Update UI
    button.classList.toggle('active', state === 'on');
    statusText.textContent = `Status: ${state.toUpperCase()}`;
    icon.style.color = state === 'on' ? '#4caf50' : '#2354b7';
    
    // Special handling for thermostat
    if (deviceId === 'thermostat') {
        statusText.textContent = `Set to: ${homeData.devices.thermostat.temperature}°C`;
    }
    
    // Update any sliders
    if (deviceId.includes('spotlight')) {
        const slider = document.getElementById(`${deviceId}-brightness`);
        if (slider) {
            slider.value = homeData.devices[deviceId].brightness;
            slider.nextElementSibling.textContent = `${homeData.devices[deviceId].brightness}%`;
        }
    } else if (deviceId === 'fan') {
        const slider = document.getElementById('fan-speed');
        if (slider) {
            slider.value = homeData.devices.fan.speed;
        }
    }
    
    updateDevicePowerUsage(deviceId);
}

function setThermostatState(state, temperature) {
    homeData.devices.thermostat.state = state;
    homeData.devices.thermostat.temperature = temperature;
    
    const deviceElement = document.querySelector('[data-device="thermostat"]');
    const button = deviceElement.querySelector('.toggle-btn');
    const statusText = deviceElement.querySelector('.status');
    const tempDisplay = document.getElementById('currentTemp');
    const icon = deviceElement.querySelector('.device-icon i');
    
    button.classList.toggle('active', state === 'on');
    tempDisplay.textContent = `${temperature}°C`;
    statusText.textContent = `Set to: ${temperature}°C`;
    icon.style.color = state === 'on' ? '#4caf50' : '#2354b7';
}

function updateDevicePowerUsage(deviceId) {
    const device = homeData.devices[deviceId];
    const deviceElement = document.querySelector(`[data-device="${deviceId}"]`);
    const powerElement = deviceElement.querySelector('.energy-usage span');
    
    let power = 0;
    
    if (device.state === 'on') {
        switch(deviceId) {
            case 'spotlight1':
            case 'spotlight2':
                // 60W at full brightness
                power = Math.round((device.brightness / 100) * 60);
                break;
            case 'fan':
                // 30W per speed level (0-3)
                power = device.speed * 30;
                break;
            case 'thermostat':
                // Fixed power for demo
                power = 500;
                break;
        }
    }
    
    powerElement.textContent = `${power}W`;
}

// Security System
function setupSecuritySystem() {
    document.getElementById('securityMode').addEventListener('change', function() {
        homeData.security.mode = this.value;
        showNotification(`Security system set to ${this.value} mode`, 'warning');
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon;
    switch(type) {
        case 'success': icon = 'fa-check-circle'; break;
        case 'warning': icon = 'fa-exclamation-triangle'; break;
        case 'error': icon = 'fa-times-circle'; break;
        default: icon = 'fa-info-circle';
    }
    
    notification.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    notificationsContainer.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Simulation Functions
function simulateSensorEvents() {
    // Random sensor events for demo purposes
    setTimeout(() => {
        if (Math.random() > 0.5) {
            showNotification('Motion detected in living room', 'warning');
        }
    }, 15000);
    
    setTimeout(() => {
        if (Math.random() > 0.5) {
            showNotification('Front door opened', 'warning');
        }
    }, 45000);
}

function showWelcomeNotification() {
    setTimeout(() => {
        showNotification('Welcome back to your smart home dashboard!', 'success');
    }, 1000);
}

// Utility Functions
function getDeviceElement(deviceId) {
    return document.querySelector(`[data-device="${deviceId}"]`);
}