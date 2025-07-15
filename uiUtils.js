// uiUtils.js
import { COLORS } from './constants.js'; // Importa los colores desde constants.js

/**
 * Obtiene referencias a los elementos del DOM principales utilizados en el dashboard.
 * @returns {object} Un objeto con las referencias a los elementos del DOM.
 */
export function getDOMElements() {
    return {
        accountsGrid: document.querySelector('.accounts-grid'),
        operatingDaysCountDisplay: document.getElementById('operatingDaysCount'),
        avgTradesPerDayDisplay: document.getElementById('avgTradesPerDay'),
        tradesPerDayChartCanvas: document.getElementById('tradesPerDayChart'),
        winrateDisplay: document.getElementById('winrateDisplay'),
        totalTradesDisplay: document.getElementById('totalTradesDisplay'),
        winrateChartCanvas: document.getElementById('winrateChart'),
        globalTrackRecordChartCanvas: document.getElementById('globalTrackRecordChart')
    };
}

/**
 * Dibuja un mensaje de carga o error en un elemento canvas.
 * @param {HTMLCanvasElement} canvas - El elemento canvas donde dibujar.
 * @param {string} message - El texto del mensaje a mostrar.
 * @param {string} color - El color del texto (ej. 'red', '#666').
 */
export function drawCanvasMessage(canvas, message, color) {
    if (!canvas) {
        console.warn('Canvas no encontrado para dibujar mensaje:', message);
        return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('No se pudo obtener el contexto 2D del canvas.');
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
    ctx.font = '16px Montserrat'; // Asegúrate de que esta fuente esté cargada
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle'; // Centrar verticalmente el texto
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

/**
 * Muestra mensajes de carga inicial en los elementos del DOM y canvases.
 * @param {object} elements - Objeto con referencias a los elementos del DOM.
 */
export function showLoadingState(elements) {
    const { 
        accountsGrid, 
        operatingDaysCountDisplay, 
        avgTradesPerDayDisplay, 
        tradesPerDayChartCanvas, 
        winrateDisplay, 
        totalTradesDisplay, 
        winrateChartCanvas, 
        globalTrackRecordChartCanvas 
    } = elements;

    if (accountsGrid) accountsGrid.innerHTML = '<p>Cargando datos de las cuentas...</p>';
    
    if (operatingDaysCountDisplay) operatingDaysCountDisplay.textContent = 'Cargando...';
    if (avgTradesPerDayDisplay) avgTradesPerDayDisplay.textContent = 'Cargando...';

    if (winrateDisplay) winrateDisplay.textContent = 'Cargando...';
    if (totalTradesDisplay) totalTradesDisplay.textContent = 'Cargando...';

    const loadingText = 'Cargando...';
    const loadingColor = COLORS.GRAY_TEXT; 

    drawCanvasMessage(tradesPerDayChartCanvas, loadingText, loadingColor);
    drawCanvasMessage(winrateChartCanvas, loadingText, loadingColor);
    drawCanvasMessage(globalTrackRecordChartCanvas, loadingText, loadingColor);
}

/**
 * Muestra mensajes de error en los elementos del DOM y canvases, y destruye instancias de Chart.
 * @param {object} elements - Objeto con referencias a los elementos del DOM.
 * @param {object} chartInstances - Objeto con las instancias de las gráficas (tradesPerDayChartInstance, winrateChartInstance, globalTrackRecordChartInstance).
 */
export function showErrorState(elements, chartInstances) {
    const { 
        accountsGrid, 
        operatingDaysCountDisplay, 
        avgTradesPerDayDisplay, 
        tradesPerDayChartCanvas, 
        winrateDisplay, 
        totalTradesDisplay, 
        winrateChartCanvas, 
        globalTrackRecordChartCanvas 
    } = elements;

    const { tradesPerDayChartInstance, winrateChartInstance, globalTrackRecordChartInstance } = chartInstances;

    if (accountsGrid) accountsGrid.innerHTML = '<div class="error-message">Error al cargar los datos. Asegúrate de que el servidor esté corriendo.</div>';
    
    if (operatingDaysCountDisplay) operatingDaysCountDisplay.textContent = 'N/A';
    if (avgTradesPerDayDisplay) avgTradesPerDayDisplay.textContent = 'N/A';
    
    // Destruir y limpiar la gráfica de trades por día
    if (tradesPerDayChartInstance) {
        tradesPerDayChartInstance.destroy();
    }
    drawCanvasMessage(tradesPerDayChartCanvas, 'Error al cargar.', COLORS.ERROR_RED);

    if (winrateDisplay) winrateDisplay.textContent = 'N/A';
    if (totalTradesDisplay) totalTradesDisplay.textContent = 'N/A';
    
    // Destruir y limpiar la gráfica de Win Rate
    if (winrateChartInstance) {
        winrateChartInstance.destroy();
    }
    drawCanvasMessage(winrateChartCanvas, 'Error al cargar.', COLORS.ERROR_RED);

    // Destruir y limpiar la gráfica de track record global
    if (globalTrackRecordChartInstance) {
        globalTrackRecordChartInstance.destroy();
    }
    drawCanvasMessage(globalTrackRecordChartCanvas, 'Error al cargar la gráfica.', COLORS.ERROR_RED);
}
