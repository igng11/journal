// app.js
const navItems = document.querySelectorAll('.nav-item');
const contentContainer = document.getElementById('content-container');

const pageUrls = {
    dashboard: '/pages/dashboard.html',
    risk: '/pages/risk.html',
    mindset: '/pages/mindset.html',
    // CAMBIO: Eliminamos 'forexfactory' de aquí porque ya no cargaremos un HTML interno para ella.
    // La lógica para 'forexfactory' se manejará directamente en loadPage con una redirección.
    // forexfactory: '/pages/forexfactory.html' // Esta línea se elimina o comenta
};

const loadedScripts = new Set(); // Para llevar un registro de scripts cargados

// Variable para almacenar el tamaño de cuenta seleccionado globalmente en la página de riesgo
let currentAccountSize = null;

async function loadPage(page) {
    // CAMBIO: Lógica de redirección para 'forexfactory' al principio de la función
    if (page === 'forexfactory') {
        console.log('Redirigiendo a Forex Factory...');
        window.open('https://www.forexfactory.com/calendar', '_blank'); // Abre en una nueva pestaña
        // Opcional: Si quieres que el contentContainer muestre un mensaje mientras redirige
        contentContainer.innerHTML = `<p style="text-align: center; padding: 50px;">Redirigiendo a <a href="https://www.forexfactory.com/calendar" target="_blank">Forex Factory</a>...</p>`;
        
        // Asegúrate de que el elemento de navegación 'forexfactory' esté activo visualmente
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        const activeNavItem = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        return; // Salir de la función loadPage, ya que no cargamos un HTML interno
    }

    // Lógica para las otras páginas (dashboard, risk, mindset)
    try {
        // Asegúrate de que la clase 'active' se maneje correctamente para las páginas internas
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        const activeNavItem = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        const response = await fetch(pageUrls[page]);
        if (!response.ok) {
            throw new Error(`Error al cargar la página ${page}: ${response.status}`);
        }
        const html = await response.text();
        contentContainer.innerHTML = html;

        // Quita la clase 'selected' de todos los items de tamaño de cuenta
        const currentAccountSizeItems = contentContainer.querySelectorAll('.account-size-item');
        currentAccountSizeItems.forEach(item => item.classList.remove('selected'));


        if (page === 'risk') {
            console.log('Contenido de risk.html cargado en contentContainer');

            // --- Funciones del módulo de riesgo (ahora definidas dentro de loadPage para evitar problemas de alcance) ---
            function updateLotSizes() {
                if (currentAccountSize === null) {
                    return;
                }

                const accountSize = currentAccountSize;
                const stopLossPips = parseFloat(contentContainer.querySelector('#stop-loss-pips').value);

                const riskTableRows = contentContainer.querySelectorAll('.risk-table tbody tr');

                if (isNaN(accountSize) || isNaN(stopLossPips) || stopLossPips <= 0) {
                    riskTableRows.forEach(row => {
                        row.querySelector('.lot-size-output').textContent = 'N/A';
                    });
                    return;
                }

                const pipValue = 0.1; // Valor de pip para EURUSD (ajusta si es necesario para otros pares)

                riskTableRows.forEach(row => {
                    const riskPercentage = parseFloat(row.dataset.risk);
                    const riskAmountUsd = accountSize * riskPercentage;
                    const lotSize = riskAmountUsd / (stopLossPips * pipValue);

                    if (!isNaN(lotSize) && isFinite(lotSize)) {
                        row.querySelector('.lot-size-output').textContent = (lotSize / 10).toFixed(2); // Dividir por 10 para lotes estándar (0.01 lotes es 10 unidades)
                    } else {
                        row.querySelector('.lot-size-output').textContent = 'Error';
                    }
                });
            }

            // Event Listeners para los cuadros de tamaño de cuenta
            const accountSizeItems = contentContainer.querySelectorAll('.account-size-item');
            const stopLossPipsInput = contentContainer.querySelector('#stop-loss-pips');

            if (accountSizeItems.length > 0) {
                accountSizeItems.forEach(item => {
                    item.addEventListener('click', () => {
                        // Remover la clase 'selected' de todos los ítems
                        accountSizeItems.forEach(i => i.classList.remove('selected'));
                        // Añadir la clase 'selected' al ítem clicado
                        item.classList.add('selected');
                        // Actualizar la variable global del tamaño de cuenta
                        currentAccountSize = parseFloat(item.dataset.account);
                        console.log('Tamaño de cuenta seleccionado:', currentAccountSize);
                        // Recalcular y mostrar los lotajes
                        updateLotSizes();
                    });
                });

                // Seleccionar el elemento con data-account="10000" por defecto
                const defaultSelectedAccountItem = contentContainer.querySelector('.account-size-item[data-account="10000"]');
                if (defaultSelectedAccountItem) {
                    defaultSelectedAccountItem.click(); // Simula un clic en el elemento de 10,000 USD
                } else {
                    // Fallback: Si no se encuentra el de 10k, seleccionar el primero disponible
                    if (accountSizeItems.length > 0) {
                        accountSizeItems[0].click();
                    }
                }
            }


            const stopLossPipsSelect = contentContainer.querySelector('#stop-loss-pips');
            if (stopLossPipsSelect) {
                stopLossPipsSelect.addEventListener('input', updateLotSizes); // Usar 'input' para actualización en tiempo real
            }

            console.log('Event listeners para cálculo de lotajes y tabla inicializados.');

            // Lógica de selección de tabla (si aún quieres el estilo visual)
            const riskTableBody = contentContainer.querySelector('.risk-table tbody');
            if (riskTableBody) {
                riskTableBody.addEventListener('click', (event) => {
                    const clickedRow = event.target.closest('tr');
                    if (clickedRow) {
                        contentContainer.querySelectorAll('.risk-table tbody tr.selected').forEach(row => {
                            row.classList.remove('selected');
                        });
                        clickedRow.classList.add('selected');
                    }
                });
                console.log('Event listener de estilo para riskTableBody agregado.');
            }

        } else if (page === 'dashboard') {
            console.log('Contenido de dashboard.html cargado en contentContainer. Importando dashboard.js...');
            // Importación dinámica del módulo dashboard.js
            // Asegúrate que dashboard.js exporta una función como `initDashboard()`
            import('/dashboard.js')
                .then(module => {
                    console.log('Módulo dashboard.js cargado exitosamente.');
                    if (typeof module.initDashboard === 'function') {
                        module.initDashboard(contentContainer); // Pasa el contentContainer si lo necesita dashboard.js
                    } else {
                        console.warn('dashboard.js no exporta la función initDashboard. Asegúrate de que tu dashboard.js tenga: `export function initDashboard(container) { ... }`');
                    }
                })
                .catch(error => {
                    console.error('Error al cargar o inicializar el módulo dashboard.js:', error);
                    const dashboardDisplay = contentContainer.querySelector('#dashboard-data-display');
                    if (dashboardDisplay) {
                        dashboardDisplay.innerHTML = '<p style="color: red;">No se pudo cargar el script del dashboard. Revisa la consola para más detalles.</p>';
                    }
                });

        } else if (page === 'mindset') {
            console.log('Contenido de mindset.html cargado en contentContainer');
            const quotes = [
                "La disciplina es el puente entre tus metas y tus logros.",
                "La paciencia es una virtud clave en el trading.",
                "No cuentes las ganancias, cuenta la consistencia.",
                "Cada error es una lección disfrazada de oportunidad.",
                "El control emocional es tu mayor ventaja.",
                "El mercado siempre tiene la razón, no tú.",
                "Sé un cazador, no un apostador. Espera tu oportunidad.",
                "Tu mayor desafío no es el mercado, sino tú mismo."
            ];
            let currentQuoteIndex = 0;

            const motivationalQuotesDiv = contentContainer.querySelector('#motivational-quotes');
            const nextQuoteButton = contentContainer.querySelector('#next-quote-button');

            function displayNextQuote() {
                if (motivationalQuotesDiv) {
                    motivationalQuotesDiv.innerHTML = `<p>"${quotes[currentQuoteIndex]}"</p>`;
                    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
                }
            }

            displayNextQuote();
            if (nextQuoteButton) {
                nextQuoteButton.addEventListener('click', displayNextQuote);
                console.log('Event listener agregado a next-quote-button (desde app.js)');
            } else {
                console.error('Error: No se encontró el botón next-quote-button (desde app.js)');
            }
        }
    } catch (error) {
        console.error('Error al cargar la página:', error);
        contentContainer.innerHTML = `<div class="error-page" style="color: red; padding: 20px;">Error al cargar la página ${page}.</div>`;
    }
}

// Manejador de clics para la navegación
navItems.forEach(item => {
    item.addEventListener('click', (event) => {
        event.preventDefault();
        const page = item.dataset.page;
        // CAMBIO: La lógica de clase 'active' se movió dentro de loadPage para manejar 'forexfactory'
        // y para evitar duplicación.
        loadPage(page);
    });
});

// Carga la página inicial (Dashboard) al cargar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    const initialPage = document.querySelector('.nav-item.active');
    if (initialPage && initialPage.dataset.page) {
        loadPage(initialPage.dataset.page);
    } else {
        loadPage('dashboard');
    }

    // CAMBIO: Definición de window.regenerateData para el botón de recarga
    window.regenerateData = async () => {
        try {
            const response = await fetch('/api/regenerate-data'); // Asume que esta API existe en server.js
            if (!response.ok) throw new Error('Error al regenerar los datos');
            const result = await response.json();
            console.log(result.message);
            // Si quieres mostrar un mensaje al usuario, puedes usar un toast o un modal
            // alert(result.message);
            // Recarga el dashboard para mostrar los datos actualizados
            loadPage('dashboard');
        } catch (error) {
            console.error('Error al regenerar datos:', error);
            // alert('Error al regenerar datos: ' + error.message);
        }
    };
});
