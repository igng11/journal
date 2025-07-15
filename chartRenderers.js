// chartRenderers.js
import { COLORS } from './constants.js';

// Variables globales para las instancias de las gráficas (manejadas aquí)
let winrateChartInstance = null;
let globalTrackRecordChartInstance = null;
let tradesPerDayChartInstance = null;

/**
 * Renderiza la gráfica de rendimiento acumulado para una cuenta individual.
 * @param {HTMLCanvasElement} canvas - El elemento canvas para la gráfica.
 * @param {Array} trades - Las operaciones de la cuenta.
 */
export function renderAccountChart(canvas, trades) {
    const ctx = canvas.getContext('2d');

    let cumulativeProfit = 0;
    const labels = [];
    const cumulativeProfitData = []; 

    if (trades && trades.length > 0) {
        const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedTrades.forEach((trade, index) => {
            cumulativeProfit += trade.profit;
            labels.push(`Trade ${index + 1} (${trade.date})`);
            cumulativeProfitData.push(cumulativeProfit); 
        });
    } else {
        labels.push('No trades');
        cumulativeProfitData.push(0); 
    }

    const lineColor = cumulativeProfit >= 0 ? COLORS.GREEN_DARK : COLORS.RED_DARK; 
    const fillColor = cumulativeProfit >= 0 ? COLORS.GREEN_LIGHT_OPAQUE : COLORS.RED_LIGHT_OPAQUE; 

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Ganancia Acumulada', 
                    data: cumulativeProfitData, 
                    borderColor: lineColor, 
                    backgroundColor: fillColor, 
                    fill: true, 
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false,
                    text: 'Rendimiento Acumulado',
                    font: {
                        size: 12
                    }
                }
            },
            scales: {
                x: {
                    display: false,
                    title: {
                        display: false,
                        text: 'Operaciones'
                    }
                },
                y: {
                    display: false,
                    beginAtZero: false,
                    title: {
                        display: false,
                        text: 'Ganancia/Pérdida ($)'
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderiza la gráfica de Win Rate global.
 * @param {HTMLCanvasElement} canvas - El elemento canvas para la gráfica.
 * @param {number} winrateValue - El valor del win rate (0-100).
 * @param {number} lossrateValue - El valor del loss rate (0-100).
 */
export function renderWinRateChart(canvas, winrateValue, lossrateValue) {
    const winrateCtx = canvas.getContext('2d');

    if (winrateChartInstance) {
        winrateChartInstance.destroy();
    }

    winrateChartInstance = new Chart(winrateCtx, {
        type: 'doughnut',
        data: {
            labels: ['Win Rate', 'Loss Rate'],
            datasets: [{
                data: [winrateValue, lossrateValue],
                backgroundColor: [
                    COLORS.GREEN_LIGHT_OPAQUE, 
                    COLORS.RED_LIGHT_OPAQUE 
                ],
                borderColor: [
                    COLORS.GREEN_DARK, 
                    COLORS.RED_DARK  
                ],
                borderWidth: 1,
                hoverBackgroundColor: [
                    COLORS.GREEN_LIGHT_SOLID, 
                    COLORS.RED_LIGHT_SOLID  
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '20%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += context.parsed.toFixed(0) + '%';
                            }
                            return label;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true
            }
        }
    });
}

/**
 * Renderiza la gráfica de Track Record Global.
 * @param {HTMLCanvasElement} canvas - El elemento canvas para la gráfica.
 * @param {Array<string>} labels - Las etiquetas del eje X (fechas o número de trades).
 * @param {Array<number>} data - Los datos de ganancia acumulada.
 * @param {number} cumulativeProfitGlobal - La ganancia acumulada total para determinar el color.
 */
export function renderGlobalTrackRecordChart(canvas, labels, data, cumulativeProfitGlobal) {
    const globalTrackRecordCtx = canvas.getContext('2d');

    if (globalTrackRecordChartInstance) {
        globalTrackRecordChartInstance.destroy();
    }

    const globalLineColor = cumulativeProfitGlobal >= 0 ? COLORS.GREEN_DARK : COLORS.RED_DARK; 
    const globalFillColor = cumulativeProfitGlobal >= 0 ? COLORS.GREEN_LIGHT_OPAQUE : COLORS.RED_LIGHT_OPAQUE; 

    globalTrackRecordChartInstance = new Chart(globalTrackRecordCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Ganancia Acumulada Global', 
                    data: data, 
                    borderColor: globalLineColor, 
                    backgroundColor: globalFillColor, 
                    fill: true, 
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false, 
                },
                title: {
                    display: false, 
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += `$${context.parsed.y.toFixed(2)}`;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: false, 
                    title: {
                        display: false,
                        text: 'Operaciones'
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: true, 
                    beginAtZero: false,
                    title: {
                        display: false, 
                        text: 'Ganancia/Pérdida Acumulada ($)',
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        color: '#333'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)' 
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        callback: function(value) {
                            return `$${value.toFixed(0)}`; 
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderiza la gráfica de Operaciones por Día.
 * @param {HTMLCanvasElement} canvas - El elemento canvas para la gráfica.
 * @param {Array<string>} labels - Las fechas de operación.
 * @param {Array<number>} data - El número de operaciones por fecha.
 */
export function renderTradesPerDayChart(canvas, labels, data) {
    const tradesPerDayCtx = canvas.getContext('2d');

    if (tradesPerDayChartInstance) {
        tradesPerDayChartInstance.destroy();
    }

    tradesPerDayChartInstance = new Chart(tradesPerDayCtx, {
        type: 'bar', 
        data: {
            labels: labels, 
            datasets: [{
                label: 'Operaciones por Día',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.7)', 
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false 
                },
                title: {
                    display: false, 
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `Operaciones: ${context.parsed.y}`;
                        },
                        title: function(context) {
                            return `Fecha: ${context[0].label}`; 
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true, 
                    title: {
                        display: false,
                        text: 'Fecha'
                    },
                    ticks: {
                        maxRotation: 45, 
                        minRotation: 45,
                        font: {
                            size: 8 
                        }
                    },
                    grid: {
                        display: false 
                    }
                },
                y: {
                    display: true, 
                    beginAtZero: true,
                    title: {
                        display: false, 
                        text: 'Número de Operaciones'
                    },
                    ticks: {
                        precision: 0, 
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)' 
                    }
                }
            }
        }
    });
}

// Exportar las instancias de las gráficas para que dashboard.js las pueda resetear en caso de error
export { winrateChartInstance, globalTrackRecordChartInstance, tradesPerDayChartInstance };
