// dashboard.js
import { initMiniCalendar } from './minicalendar.js';
import { COLORS, API_URL, API_REGENERATE_URL } from './constants.js';
import { getDOMElements, showLoadingState, showErrorState, drawCanvasMessage } from './uiUtils.js';
import { renderAccountCard } from './accountRenderer.js';
import { 
    renderAccountChart, 
    winrateChartInstance, // Importa las instancias de las gráficas para poder resetearlas
    globalTrackRecordChartInstance,
    tradesPerDayChartInstance
} from './chartRenderers.js'; 
import { 
    processAndRenderWinRate, 
    processAndRenderTradesPerDay, 
    processAndRenderGlobalTrackRecord,
    handleNoGlobalData
} from './dashboardMetrics.js'; // Importa las nuevas funciones

console.log('dashboard.js cargado');

// Exporta initDashboard para que app.js pueda llamarla
export function initDashboard() {
    console.log('initDashboard() se está ejecutando desde el módulo dashboard.js');
    fetchAccountData();
    window.regenerateData = regenerateData;
}

// Función principal para obtener los datos del servidor
async function fetchAccountData() {
    console.log('fetchAccountData() se está ejecutando para obtener datos del servidor...');
    
    const elements = getDOMElements();
    showLoadingState(elements);

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Error HTTP! Estado: ${response.status}`);
        }
        const data = await response.json();
        console.log('Datos recibidos del servidor:', data);
        
        // Destruir instancias de gráficas antes de volver a dibujar
        if(winrateChartInstance) winrateChartInstance.destroy();
        if(globalTrackRecordChartInstance) globalTrackRecordChartInstance.destroy();
        if(tradesPerDayChartInstance) tradesPerDayChartInstance.destroy();
        
        displayDashboard(data);
    } catch (error) {
        console.error('Error al obtener los datos de las cuentas:', error);
        showErrorState(elements, { winrateChartInstance, globalTrackRecordChartInstance, tradesPerDayChartInstance });
    }
}

// Función para regenerar los datos en el servidor y luego volver a cargarlos
async function regenerateData() {
    console.log('Regenerando datos en el servidor...');
    const accountsGrid = document.querySelector('.accounts-grid');
    if (accountsGrid) accountsGrid.innerHTML = '<p>Regenerando datos y volviendo a cargar...</p>';

    try {
        const response = await fetch(API_REGENERATE_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log('Mensaje del servidor al regenerar:', result.message);
        await fetchAccountData();
    } catch (error) {
        console.error('Error al regenerar los datos:', error);
        if (accountsGrid) accountsGrid.innerHTML = '<div class="error-message">Error al regenerar los datos.</div>';
    }
}

/**
 * Orquesta la visualización de todo el dashboard: métricas globales y tarjetas de cuenta.
 * @param {object} data - Los datos de las cuentas.
 */
function displayDashboard(data) {
    const { accountsGrid } = getDOMElements();

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
            const accountCardElement = renderAccountCard(account, renderAccountChart);
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

        // Procesa y renderiza las métricas y gráficas globales
        processAndRenderWinRate(winningTradesGlobal, totalTradesGlobal);
        processAndRenderTradesPerDay(allTrades);
        processAndRenderGlobalTrackRecord(allTrades);

    } else {
        // Manejo de "No Datos" para todo el dashboard
        accountsGrid.innerHTML = '<div class="error-message">No hay información de cuentas disponible. Asegúrate de que los archivos de reporte existan y sean procesables.</div>';
        handleNoGlobalData();
    }
}
