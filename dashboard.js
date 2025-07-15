// dashboard.js
import { initMiniCalendar } from './minicalendar.js';
import { COLORS, API_URL, API_REGENERATE_URL } from './constants.js';
import { getDOMElements, showLoadingState, showErrorState, drawCanvasMessage } from './uiUtils.js';
import { renderAccountCard } from './accountRenderer.js'; // Importa la nueva función
import { 
    renderAccountChart, 
    renderWinRateChart, 
    renderGlobalTrackRecordChart, 
    renderTradesPerDayChart,
    winrateChartInstance, // Importa las instancias de las gráficas
    globalTrackRecordChartInstance,
    tradesPerDayChartInstance
} from './chartRenderers.js'; 

console.log('dashboard.js cargado');

// Las variables globales de las instancias de las gráficas ahora se gestionan en chartRenderers.js
// No es necesario redeclararlas aquí, solo importarlas si se necesitan para resetearlas.

// Exporta initDashboard para que app.js pueda llamarla
export function initDashboard() {
    console.log('initDashboard() se está ejecutando desde el módulo dashboard.js');
    fetchAccountData();
    window.regenerateData = regenerateData; // Exponer para el onclick en dashboard.html
}

// Función principal para obtener los datos del servidor
async function fetchAccountData() {
    console.log('fetchAccountData() se está ejecutando para obtener datos del servidor...');
    
    const elements = getDOMElements(); // Obtener todas las referencias a los elementos del DOM
    showLoadingState(elements); // Mostrar mensajes de carga

    try {
        const response = await fetch(API_URL); // Usar la URL de la API desde constants.js
        if (!response.ok) {
            throw new Error(`Error HTTP! Estado: ${response.status}`);
        }
        const data = await response.json();
        console.log('Datos recibidos del servidor:', data);
        displayAccountsGrid(data); 
    } catch (error) {
        console.error('Error al obtener los datos de las cuentas:', error);
        // Pasar las instancias de las gráficas para que showErrorState pueda destruirlas
        showErrorState(elements, { tradesPerDayChartInstance, winrateChartInstance, globalTrackRecordChartInstance });
    }
}

// Función para regenerar los datos en el servidor y luego volver a cargarlos
async function regenerateData() {
    console.log('Regenerando datos en el servidor...');
    const accountsGrid = document.querySelector('.accounts-grid');
    if (accountsGrid) accountsGrid.innerHTML = '<p>Regenerando datos y volviendo a cargar...</p>';

    try {
        const response = await fetch(API_REGENERATE_URL); // Usar la URL de la API desde constants.js
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log('Mensaje del servidor al regenerar:', result.message);
        await fetchAccountData(); // Vuelve a cargar los datos frescos
    } catch (error) {
        console.error('Error al regenerar los datos:', error);
        if (accountsGrid) accountsGrid.innerHTML = '<div class="error-message">Error al regenerar los datos.</div>';
    }
}

/**
 * Muestra la cuadrícula de cuentas y renderiza las gráficas principales.
 * @param {object} data - Los datos de las cuentas.
 */
function displayAccountsGrid(data) {
    const elements = getDOMElements(); // Re-obtener elementos para asegurar que estén actualizados
    const { accountsGrid, winrateDisplay, totalTradesDisplay, winrateChartCanvas, 
            operatingDaysCountDisplay, avgTradesPerDayDisplay, tradesPerDayChartCanvas,
            globalTrackRecordChartCanvas } = elements;

    if (!accountsGrid) {
        console.error("Error: No se encontró el elemento .accounts-grid.");
        return;
    }
    accountsGrid.innerHTML = ''; // Limpiar el contenido existente

    let totalTradesGlobal = 0;
    let winningTradesGlobal = 0;
    let allTrades = [];

    if (data && data.mt5_accounts && Array.isArray(data.mt5_accounts) && data.mt5_accounts.length > 0) {
        data.mt5_accounts.forEach(account => {
            // Renderiza la tarjeta de la cuenta usando la función del nuevo módulo
            const accountCardElement = renderAccountCard(account, renderAccountChart); // Pasa la función de renderizado de gráfica
            accountsGrid.appendChild(accountCardElement);

            // Acumula trades para las métricas globales
            if (account.trades && account.trades.length > 0) {
                account.trades.forEach(trade => {
                    totalTradesGlobal++;
                    if (trade.profit >= 0) {
                        winningTradesGlobal++;
                    }
                    allTrades.push(trade);
                });
            }
        }); 

        // Cálculo y display del winrate
        let calculatedWinrate = 0;
        if (totalTradesGlobal > 0) {
            calculatedWinrate = (winningTradesGlobal / totalTradesGlobal) * 100;
        }
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

        // Renderiza la gráfica de Win Rate global
        renderWinRateChart(winrateChartCanvas, parseFloat(calculatedWinrate.toFixed(0)), 100 - parseFloat(calculatedWinrate.toFixed(0)));

        // Llama a la nueva función para calcular y mostrar la Actividad Diaria
        calculateTradesPerDayMetricsAndChart(allTrades);

        // Lógica para la GRÁFICA DE TRACK RECORD GLOBAL
        if (globalTrackRecordChartCanvas) {
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
        } else {
            console.warn("Elemento canvas para la gráfica de track record global (id 'globalTrackRecordChart') no encontrado.");
        }

    } else {
        accountsGrid.innerHTML = '<div class="error-message">No hay información de cuentas disponible. Asegúrate de que los archivos de reporte existan y sean procesables.</div>';
        
        // Manejo de no datos para Actividad Diaria
        if (operatingDaysCountDisplay) operatingDaysCountDisplay.textContent = '0';
        if (avgTradesPerDayDisplay) avgTradesPerDayDisplay.textContent = '0.0';
        drawCanvasMessage(tradesPerDayChartCanvas, 'No hay datos de operaciones para mostrar.', COLORS.GRAY_TEXT);

        // Manejo de no datos para Win Rate
        if (winrateDisplay) winrateDisplay.textContent = '0%';
        if (totalTradesDisplay) totalTradesDisplay.textContent = '0';
        drawCanvasMessage(winrateChartCanvas, 'No hay datos de operaciones para mostrar.', COLORS.GRAY_TEXT);

        // Limpiar la gráfica de track record global si no hay datos
        drawCanvasMessage(globalTrackRecordChartCanvas, 'No hay datos de operaciones para mostrar.', COLORS.GRAY_TEXT);
    }
}

/**
 * Calcula las métricas de operaciones por día y dibuja la gráfica.
 * @param {Array} allTrades - Todas las operaciones de todas las cuentas.
 */
function calculateTradesPerDayMetricsAndChart(allTrades) {
    const operatingDaysCountDisplay = document.getElementById('operatingDaysCount');
    const avgTradesPerDayDisplay = document.getElementById('avgTradesPerDay');
    const tradesPerDayChartCanvas = document.getElementById('tradesPerDayChart');

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
