// Load chart data
fetch('data.json')
  .then(res => res.json())
  .then(data => {
    const ctx = document.getElementById('temperatureChart');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.timestamps,
        datasets: [{
          label: 'Temperature (°C)',
          data: data.temperatures,
          borderColor: 'red',
          fill: false,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  });

// Handle button toggles
document.querySelectorAll('.toggle-btn').forEach(button => {
  button.addEventListener('click', () => {
    const parent = button.closest('.device');
    const statusText = parent.querySelector('.status');
    const isActive = button.classList.toggle('active');

    statusText.textContent = `Status: ${isActive ? 'ON' : 'OFF'}`;
  });
});
