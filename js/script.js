const chartCanvas = document.getElementById("marketChart");

if (chartCanvas && window.Chart) {
    const labels = ["09:00", "10:00", "11:00", "12:00",
                    "13:00", "14:00", "15:00"];

    const prices = [1.0820, 1.0832, 1.0818, 1.0840,
                    1.0835, 1.0852, 1.0845];

    new Chart(chartCanvas, {
        type: "line",

        data: {
            labels: labels,

            datasets: [{
                label: "Illustrative EUR/USD",
                data: prices,
                borderColor: "#9b7bff",
                backgroundColor: "rgba(155,123,255,0.12)",
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 5
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    backgroundColor: "#101827"
                }
            },

            scales: {
                x: {
                    grid: {
                        display: false
                    },

                    ticks: {
                        color: "#96a2b7",
                        maxTicksLimit: 5
                    },

                    border: {
                        display: false
                    }
                },

                y: {
                    grid: {
                        color: "rgba(255,255,255,0.06)"
                    },

                    ticks: {
                        color: "#96a2b7",
                        maxTicksLimit: 5
                    },

                    border: {
                        display: false
                    }
                }
            }
        }
    });
}