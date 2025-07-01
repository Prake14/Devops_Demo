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
          borderColor: 'red'
        }]
      }
    });
  });