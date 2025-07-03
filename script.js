// script.js - Ultra Super Home Automation Dashboard Controller

// DOM Elements
const currentTimeElement = document.getElementById('currentTime');
const outsideTempElement = document.getElementById('outsideTemp');
const outsideHumidityElement = document.getElementById('outsideHumidity');
const themeSwitch = document.getElementById('themeSwitch');
const notificationsContainer = document.getElementById('notifications');
const roomElements = document.querySelectorAll('.room');
const roomDeviceSections = document.querySelectorAll('.room-devices');

// Global Variables
let environmentChart;
let energyChart;
let homeData = {};
let currentRoom = 'living';

// Initialize Application
document.addEventListener('DOMContentLoaded', async function() {
    await loadHomeData();
    initializeClock();
    initializeWeather();
    initializeEnvironmentChart();
    initializeEnergyChart();
    setupDeviceControls();
    setupSecuritySystem();
    setupThemeToggle();
    setupRoomSelection();
    simulateSensorEvents();
    showWelcomeNotification();
});

// Data Loading
async function loadHomeData() {
    try {
        const response = await fetch('data.json');
        homeData = await response.json();
        initializeDeviceStates();
    } catch (error) {
        console.error('Error loading home data:', error);
        showNotification('Failed to load home data', 'error');
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
            weekly: [18.5, 17.8, 19.2, 20.1, 22.3, 24.5, 21.8]
        },
        devices: {
            spotlight1: { state: "off", brightness: 0 },
            spotlight2: { state: "off", brightness: 0 },
            fan: { state: "off", speed: 0 },
            ac: { state: "off", temperature: 22, mode: "cool" },
            "kitchen-light": { state: "off", brightness: 0 },
            "exhaust-fan": { state: "off", speed: 0 }
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
    setDeviceState('ac', homeData.devices.ac.state, homeData.devices.ac.temperature);
    setDeviceState('kitchen-light', homeData.devices["kitchen-light"].state, homeData.devices["kitchen-light"].brightness);
    setDeviceState('exhaust-fan', homeData.devices["exhaust-fan"].state, homeData.devices["exhaust-fan"].speed);
    
    // Set security mode
    document.getElementById('securityMode').value = homeData.security.mode;
}

// Theme Toggle
function setupThemeToggle() {
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        themeSwitch.checked = true;
    }
    
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });
}

// Room Selection
function setupRoomSelection() {
    roomElements.forEach(room => {
        room.addEventListener('click', function() {
            const roomId = this.dataset.room;
            
            // Update active room in UI
            roomElements.forEach(r => r.classList.remove('active'));
            this.classList.add('active');
            
            // Update active room devices
            roomDeviceSections.forEach(section => {
                section.classList.remove('active');
                if (section.dataset.room === roomId) {
                    section.classList.add('active');
                }
            });
            
            currentRoom = roomId;
            showNotification(`${this.textContent} controls activated`, 'info');
        });
    });
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
    
    const weatherIcon = document.querySelector('.weather-icon');
    const humidityIcon = document.querySelector('.humidity-icon');
    
    switch(homeData.weather.conditions) {
        case 'sunny': 
            weatherIcon.className = 'fas fa-sun weather-icon';
            break;
        case 'cloudy': 
            weatherIcon.className = 'fas fa-cloud weather-icon';
            break;
        case 'rainy': 
            weatherIcon.className = 'fas fa-cloud-rain weather-icon';
            break;
        default: 
            weatherIcon.className = 'fas fa-sun weather-icon';
    }
    
    // Animate humidity icon in dark mode
    if (document.body.classList.contains('dark-mode')) {
        humidityIcon.style.animation = 'pulse 2s infinite alternate';
    } else {
        humidityIcon.style.animation = 'none';
    }
}

function updateWeatherData() {
    // Simulate small weather changes
    homeData.weather.temperature += (Math.random() * 2 - 1);
    homeData.weather.humidity += (Math.random() * 4 - 2);
    
    // Keep within reasonable bounds
    homeData.weather.temperature = Math.max(15, Math.min(35, homeData.weather.temperature));
    homeData.weather.humidity = Math.max(30, Math.min(80, homeData.weather.humidity));
    
    // Randomly change conditions
    const conditions = ['sunny', 'cloudy', 'rainy'];
    if (Math.random() > 0.9) {
        homeData.weather.conditions = conditions[Math.floor(Math.random() * conditions.length)];
    }
    
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
        maintainAspectRatio: false,
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
            x: { 
                grid: { 
                    display: false,
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    color: 'var(--text-color)'
                }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: { 
                    display: true, 
                    text: 'Temperature (°C)',
                    color: 'var(--text-color)'
                },
                ticks: {
                    color: 'var(--text-color)'
                },
                grid: {
                    color: 'var(--border-color)'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { 
                    drawOnChartArea: false,
                    color: 'var(--border-color)'
                },
                title: { 
                    display: true, 
                    text: 'Humidity (%)',
                    color: 'var(--text-color)'
                },
                ticks: {
                    color: 'var(--text-color)'
                },
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
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'kWh',
                        color: 'var(--text-color)'
                    },
                    ticks: {
                        color: 'var(--text-color)'
                    },
                    grid: {
                        color: 'var(--border-color)'
                    }
                },
                x: {
                    ticks: {
                        color: 'var(--text-color)'
                    },
                    grid: {
                        color: 'var(--border-color)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'var(--text-color)'
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
            
            // Update chart data based on range
            if (this.dataset.range === '24h') {
                environmentChart.data.labels = homeData.environment.timestamps;
                environmentChart.data.datasets[0].data = homeData.environment.temperatures;
                environmentChart.data.datasets[1].data = homeData.environment.humidities;
                environmentChart.update();
                
                energyChart.data.datasets[0].data = homeData.energy.daily;
                energyChart.update();
            } else if (this.dataset.range === '7d') {
                // For demo, just show weekly data
                energyChart.data.datasets[0].data = homeData.energy.weekly;
                energyChart.update();
            }
            
            showNotification(`Showing ${this.dataset.range} data`, 'info');
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
    document.getElementById('ac-temp-up').addEventListener('click', function() {
        const currentTemp = homeData.devices.ac.temperature;
        if (currentTemp < 30) {
            setDeviceState('ac', homeData.devices.ac.state, currentTemp + 1);
            showNotification(`AC temperature set to ${currentTemp + 1}°C`, 'info');
        }
    });
    
    document.getElementById('ac-temp-down').addEventListener('click', function() {
        const currentTemp = homeData.devices.ac.temperature;
        if (currentTemp > 16) {
            setDeviceState('ac', homeData.devices.ac.state, currentTemp - 1);
            showNotification(`AC temperature set to ${currentTemp - 1}°C`, 'info');
        }
    });
}

function setDeviceState(deviceId, state, value = null) {
    const deviceElement = document.querySelector(`[data-device="${deviceId}"]`);
    if (!deviceElement) return;
    
    const button = deviceElement.querySelector('.toggle-btn');
    const statusText = deviceElement.querySelector('.status');
    const icon = deviceElement.querySelector('.device-icon i');
    
    // Update data model
    homeData.devices[deviceId].state = state;
    if (value !== null) {
        if (deviceId === 'fan' || deviceId === 'exhaust-fan') {
            homeData.devices[deviceId].speed = value;
        } else if (deviceId.includes('light') || deviceId.includes('spotlight')) {
            homeData.devices[deviceId].brightness = value;
        } else if (deviceId === 'ac') {
            homeData.devices[deviceId].temperature = value;
        }
    }
    
    // Update UI
    button.classList.toggle('active', state === 'on');
    statusText.textContent = `Status: ${state.toUpperCase()}`;
    icon.style.color = state === 'on' ? 'var(--accent-color)' : 'var(--primary-color)';
    
    // Special handling for thermostat/AC
    if (deviceId === 'ac') {
        statusText.textContent = `Set to: ${homeData.devices.ac.temperature}°C`;
        document.getElementById('ac-currentTemp').textContent = `${homeData.devices.ac.temperature}°C`;
    }
    
    // Update any sliders
    if (deviceId.includes('light') || deviceId.includes('spotlight')) {
        const slider = document.getElementById(`${deviceId}-brightness`);
        if (slider) {
            slider.value = homeData.devices[deviceId].brightness;
            slider.nextElementSibling.textContent = `${homeData.devices[deviceId].brightness}%`;
        }
    } else if (deviceId === 'fan' || deviceId === 'exhaust-fan') {
        const slider = document.getElementById(`${deviceId}-speed`);
        if (slider) {
            slider.value = homeData.devices[deviceId].speed;
            if (slider.nextElementSibling) {
                const speedLabels = ['Off', 'Low', 'Medium', 'High'];
                slider.nextElementSibling.textContent = speedLabels[homeData.devices[deviceId].speed];
            }
        }
    }
    
    updateDevicePowerUsage(deviceId);
    
    // Add animation when turning on
    if (state === 'on') {
        icon.classList.add('device-on-animation');
        setTimeout(() => {
            icon.classList.remove('device-on-animation');
        }, 1000);
    }
}

function updateDevicePowerUsage(deviceId) {
    const device = homeData.devices[deviceId];
    const deviceElement = document.querySelector(`[data-device="${deviceId}"]`);
    if (!deviceElement) return;
    
    const powerElement = deviceElement.querySelector('.energy-usage span');
    if (!powerElement) return;
    
    let power = 0;
    
    if (device.state === 'on') {
        if (deviceId.includes('light') || deviceId.includes('spotlight')) {
            // 60W at full brightness
            power = Math.round((device.brightness / 100) * 60);
        } else if (deviceId.includes('fan')) {
            // 30W per speed level (0-3)
            power = device.speed * 30;
        } else if (deviceId === 'ac') {
            // Fixed power for demo
            power = 500 + (device.temperature < 22 ? 200 : 0);
        }
    }
    
    powerElement.textContent = `${power}W`;
}

// Security System
function setupSecuritySystem() {
    document.getElementById('securityMode').addEventListener('change', function() {
        homeData.security.mode = this.value;
        showNotification(`Security system set to ${this.value} mode`, 'warning');
        
        // In a real app, this would trigger actual security changes
        if (this.value === 'away') {
            // Simulate turning off lights when away
            if (homeData.devices.spotlight1.state === 'on') {
                setDeviceState('spotlight1', 'off');
            }
            if (homeData.devices.spotlight2.state === 'on') {
                setDeviceState('spotlight2', 'off');
            }
        }
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
    
    // Simulate periodic temperature changes
    setInterval(() => {
        // Random small temperature fluctuation
        const change = (Math.random() * 0.4 - 0.2);
        homeData.environment.temperatures = homeData.environment.temperatures.map(t => {
            const newTemp = t + change;
            return Math.max(18, Math.min(32, newTemp));
        });
        
        // Update chart if visible
        if (environmentChart) {
            environmentChart.data.datasets[0].data = homeData.environment.temperatures;
            environmentChart.update();
        }
    }, 30000);
}

function showWelcomeNotification() {
    setTimeout(() => {
        showNotification('Welcome to ELECTRONICS Smart Home System', 'success');
    }, 1000);
}

// Utility Functions
function getDeviceElement(deviceId) {
    return document.querySelector(`[data-device="${deviceId}"]`);
}