// forexfactory.js

/**
 * Inicializa la lógica de la sección Forex Factory.
 * Esta función es llamada por app.js después de cargar forexfactory.html.
 * @param {HTMLElement} container - El contenedor principal de la página de Forex Factory (ej. #content-container).
 */
export function initializeForexFactorySection(container) {
    console.log('initializeForexFactorySection() se está ejecutando desde forexfactory.js');

    const newsListContainer = container.querySelector('#forexfactory-news-list');

    // Datos mock de noticias de "carpeta roja"
    const mockNews = [
        { time: '08:30 AM', currency: 'USD', event: 'IPC Subyacente (Mensual)', impactAlt: 'High Impact', impactIcon: 'https://cdn.forexfactory.com/images/impact/red.gif' },
        { time: '08:30 AM', currency: 'USD', event: 'Ventas Minoristas (Mensual)', impactAlt: 'High Impact', impactIcon: 'https://cdn.forexfactory.com/images/impact/red.gif' },
        { time: '10:00 AM', currency: 'USD', event: 'Confianza del Consumidor CB', impactAlt: 'High Impact', impactIcon: 'https://cdn.forexfactory.com/images/impact/red.gif' },
        { time: '09:45 AM', currency: 'EUR', event: 'Decisión de Tipo de Interés BCE', impactAlt: 'High Impact', impactIcon: 'https://cdn.forexfactory.com/images/impact/red.gif' },
        { time: '10:00 AM', currency: 'GBP', event: 'IPC (Anual)', impactAlt: 'High Impact', impactIcon: 'https://cdn.forexfactory.com/images/impact/red.gif' },
        { time: '14:00 PM', currency: 'CAD', event: 'Decisión de Tipo de Interés BoC', impactAlt: 'High Impact', impactIcon: 'https://cdn.forexfactory.com/images/impact/red.gif' },
        { time: '20:00 PM', currency: 'AUD', event: 'IPC (Trimestral)', impactAlt: 'High Impact', impactIcon: 'https://cdn.forexfactory.com/images/impact/red.gif' },
    ];

    // Función para mostrar las noticias
    function displayNews(newsData) {
        if (!newsListContainer) {
            console.error('Contenedor de noticias no encontrado en forexfactory.html');
            return;
        }
        newsListContainer.innerHTML = ''; // Limpiar mensaje de carga

        if (newsData.length === 0) {
            newsListContainer.innerHTML = '<p class="loading-message">No se encontraron noticias de impacto alto para hoy.</p>';
            return;
        }

        newsData.forEach(item => {
            const newsItemDiv = document.createElement('div');
            newsItemDiv.classList.add('news-item');
            newsItemDiv.innerHTML = `
                <div class="news-time">${item.time}</div>
                <div class="news-currency">${item.currency}</div>
                <div class="news-impact"><img src="${item.impactIcon}" alt="${item.impactAlt}"></div>
                <div class="news-event">${item.event}</div>
            `;
            newsListContainer.appendChild(newsItemDiv);
        });
        console.log('Noticias de Forex Factory cargadas y mostradas.');
    }

    // Cargar y mostrar las noticias mock al inicializar la sección
    displayNews(mockNews);
}
