// dashboardMetrics.js
import { getDOMElements } from './uiUtils.js';
import { renderWinRateChart, renderGlobalTrackRecordChart, renderTradesPerDayChart } from './chartRenderers.js';
import { COLORS } from './constants.js';

/**
 * Actualiza los elementos del DOM con las métricas de Win Rate.
 * @param {number} calculatedWinrate - El porcentaje de Win Rate.
 * @param {number} totalTradesGlobal - El número total de operaciones.
 */
function updateWinRateDisplay(calculatedWinrate, totalTradesGlobal) {
    const { winrateDisplay, totalTradesDisplay } = getDOMElements();
    if (winrateDisplay) {
        winrateDisplay.textContent = `${calculatedWinrate.toFixed(0)}%`;
    } else {
        console.warn("Elemento para winrate (id 'winrateDisplay') no encontrado.");
    }
    if (totalTradesDisplay) {
        totalTradesDisplay.textContent = `${totalTradesGlobal}`;
    } else {
        console.warn("Elemento para total de trades (id 'totalTradesDisplay') no encontrado.");
    }
}

/**
 * Calcula y renderiza la gráfica de Win Rate global.
 * @param {number} winningTradesGlobal - Número de operaciones ganadoras.
 * @param {number} totalTradesGlobal - Número total de operaciones.
 */
export function processAndRenderWinRate(winningTradesGlobal, totalTradesGlobal) {
    let calculatedWinrate = 0;
    if (totalTradesGlobal > 0) {
        calculatedWinrate = (winningTradesGlobal / totalTradesGlobal) * 100;
    }
    updateWinRateDisplay(calculatedWinrate, totalTradesGlobal);

    const { winrateChartCanvas } = getDOMElements();
    if (winrateChartCanvas) {
        renderWinRateChart(winrateChartCanvas, parseFloat(calculatedWinrate.toFixed(0)), 100 - parseFloat(calculatedWinrate.toFixed(0)));
    } else {
        console.warn("Elemento canvas para la gráfica de winrate (id 'winrateChart') no encontrado.");
    }
}

/**
 * Calcula las métricas de operaciones por día y dibuja la gráfica.
 * @param {Array} allTrades - Todas las operaciones de todas las cuentas.
 */
export function processAndRenderTradesPerDay(allTrades) {
    const { operatingDaysCountDisplay, avgTradesPerDayDisplay, tradesPerDayChartCanvas } = getDOMElements();

    if (!operatingDaysCountDisplay || !avgTradesPerDayDisplay || !tradesPerDayChartCanvas) {
        console.warn('Elementos de Actividad Diaria no encontrados. No se puede renderizar.');
        return;
    }

    // 1. Contar operaciones por día
    const tradesByDate = {};
    allTrades.forEach(trade => {
        const tradeDate = trade.date.split(' ')[0]; 
        if (tradesByDate[tradeDate]) {
            tradesByDate[tradeDate]++;
        } else {
            tradesByDate[tradeDate] = 1;
        }
    });

    // Ordenar las fechas para la gráfica
    const sortedDates = Object.keys(tradesByDate).sort((a, b) => new Date(a) - new Date(b));

    // 2. Calcular Días de Operación y Promedio de Operaciones por Día
    const operatingDays = sortedDates.length;
    let totalTradesOnOperatingDays = 0;
    const tradesPerDayData = [];

    sortedDates.forEach(date => {
        totalTradesOnOperatingDays += tradesByDate[date];
        tradesPerDayData.push(tradesByDate[date]);
    });

    const averageTradesPerOperatingDay = operatingDays > 0 ? (totalTradesOnOperatingDays / operatingDays) : 0;

    // Actualizar el display en el HTML
    operatingDaysCountDisplay.textContent = operatingDays;
    avgTradesPerDayDisplay.textContent = averageTradesPerOperatingDay.toFixed(1);

    // 3. Dibujar la gráfica de Actividad Diaria
    renderTradesPerDayChart(tradesPerDayChartCanvas, sortedDates, tradesPerDayData);
    console.log('Gráfica de Actividad Diaria dibujada.');
}

/**
 * Calcula y renderiza la gráfica de Track Record Global.
 * @param {Array} allTrades - Todas las operaciones de todas las cuentas.
 */
export function processAndRenderGlobalTrackRecord(allTrades) {
    const { globalTrackRecordChartCanvas } = getDOMElements();

    if (!globalTrackRecordChartCanvas) {
        console.warn("Elemento canvas para la gráfica de track record global (id 'globalTrackRecordChart') no encontrado.");
        return;
    }

    const sortedAllTrades = [...allTrades].sort((a, b) => new Date(a.date) - new Date(b.date));

    let cumulativeProfitGlobal = 0;
    const globalLabels = [];
    const globalCumulativeProfitData = []; 

    if (sortedAllTrades.length > 0) {
        sortedAllTrades.forEach((trade, index) => {
            cumulativeProfitGlobal += trade.profit;
            globalLabels.push(`Trade ${index + 1} (${trade.date})`);
            globalCumulativeProfitData.push(cumulativeProfitGlobal); 
        });
    } else {
        globalLabels.push('No trades');
        globalCumulativeProfitData.push(0); 
    }

    renderGlobalTrackRecordChart(globalTrackRecordChartCanvas, globalLabels, globalCumulativeProfitData, cumulativeProfitGlobal);
}

/**
 * Maneja el estado de "no datos" para las métricas globales.
 */
export function handleNoGlobalData() {
    const { 
        operatingDaysCountDisplay, avgTradesPerDayDisplay, tradesPerDayChartCanvas,
        winrateDisplay, totalTradesDisplay, winrateChartCanvas,
        globalTrackRecordChartCanvas 
    } = getDOMElements();

    if (operatingDaysCountDisplay) operatingDaysCountDisplay.textContent = '0';
    if (avgTradesPerDayDisplay) avgTradesPerDayDisplay.textContent = '0.0';
    drawCanvasMessage(tradesPerDayChartCanvas, 'No hay datos de operaciones para mostrar.', COLORS.GRAY_TEXT);

    if (winrateDisplay) winrateDisplay.textContent = '0%';
    if (totalTradesDisplay) totalTradesDisplay.textContent = '0';
    drawCanvasMessage(winrateChartCanvas, 'No hay datos de operaciones para mostrar.', COLORS.GRAY_TEXT);

    drawCanvasMessage(globalTrackRecordChartCanvas, 'No hay datos de operaciones para mostrar.', COLORS.GRAY_TEXT);
}
