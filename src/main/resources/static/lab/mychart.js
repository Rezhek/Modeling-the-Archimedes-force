let isothermChart;

document.addEventListener("DOMContentLoaded", function() {
    const data = window.gasData;

    const v2Slider = document.getElementById('v2_slider');
    const v2Display = document.getElementById('v2_display');
    const v2InputHidden = document.getElementById('v2_input');
    const gasFill = document.getElementById('gas-fill');
    const canvas = document.getElementById('isothermChart');

    if (data && data.currentP > 0 && canvas) {
        const ctx = canvas.getContext('2d');

        isothermChart = createChart(ctx, data);

        function syncAll(value) {
            const val = parseFloat(value);

            if (v2Display) v2Display.textContent = val.toFixed(2);
            if (v2InputHidden) v2InputHidden.value = val.toFixed(2);

            if (gasFill) {
                const maxSliderV = 250;
                const heightPercent = (val / maxSliderV) * 100;
                gasFill.style.height = Math.min(heightPercent, 100) + "%";
            }

            const newP2 = (data.mass * data.R * data.temp) / (data.molarMass * val);

            updateChartPoint(val, newP2);
        }

        if (v2Slider) {
            v2Slider.addEventListener('input', function() {
                syncAll(this.value);
            });
            syncAll(v2Slider.value);
        }
    }
});

function createChart(ctx, data) {
    const curvePoints = [];

    const startV = Math.min(data.currentV, data.postV);
    const endV = Math.max(data.currentV, data.postV);

    const steps = 50;
    const stepSize = (endV - startV) / steps;

    for (let i = 0; i <= steps; i++) {
        let v = startV + (i * stepSize);
        if (v <= 0) v = 0.1;

        let p = (data.mass * data.R * data.temp) / (data.molarMass * v);
        curvePoints.push({ x: v, y: p });
    }

    return new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Изотермический процесс',
                    data: curvePoints,
                    borderColor: '#000066',
                    borderWidth: 3,
                    pointRadius: 0,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Текущее состояние',
                    data: [{ x: data.postV, y: data.postP }],
                    backgroundColor: '#ff4d4d',
                    borderColor: '#fff',
                    borderWidth: 2,
                    pointRadius: 6,
                    showLine: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'Объем V (м³)', font: { weight: 'bold' } },
                    min: startV * 0.9,
                    max: endV * 1.1
                },
                y: {
                    type: 'linear',
                    title: { display: true, text: 'Давление P (Па)', font: { weight: 'bold' } },
                    beginAtZero: false
                }
            },
            plugins: {
                legend: { display: false }
            },
            animation: { duration: 0 }
        }
    });
}

function updateChartPoint(v, p) {
    if (isothermChart) {
        isothermChart.data.datasets[1].data = [{ x: v, y: p }];
        isothermChart.update('none');
    }
}