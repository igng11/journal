// accountRenderer.js
import { initMiniCalendar } from './minicalendar.js';
import { COLORS } from './constants.js'; // Importa los colores unificados

/**
 * Renderiza la tarjeta de una cuenta individual, incluyendo sus métricas, logos,
 * mini-calendario y el canvas para su gráfica de rendimiento.
 * @param {object} account - Los datos de la cuenta a renderizar.
 * @param {function} renderAccountChart - Función para renderizar la gráfica de rendimiento de la cuenta.
 * @returns {HTMLElement} El contenedor completo de la tarjeta de la cuenta.
 */
export function renderAccountCard(account, renderAccountChart) {
    // Obtener el balance inicial de la cuenta, si no está definido, usar 10000 como fallback
    const initialBalance = account.initialBalance || 10000; 
    const currentProfit = account.balance - initialBalance;
    const profitColor = currentProfit >= 0 ? COLORS.GREEN_DARK : COLORS.RED_DARK;
    const performancePercentage = ((currentProfit / initialBalance) * 100).toFixed(1);

    const accountPairContainer = document.createElement('div');
    accountPairContainer.classList.add('account-pair');

    const accountCard = document.createElement('div');
    accountCard.classList.add('account-card');
    accountCard.classList.add('clickable');

    const accountContent = document.createElement('div');
    accountContent.classList.add('account-content');
    accountContent.innerHTML = `
        <h3 class="account-name">${account.name}</h3>
        <p class="account-server">Servidor: ${account.server}</p>
        <p class="account-server">Tamaño de cuenta: ${initialBalance.toFixed(0)} ${account.currency}</p>
        <p class="account-server">Balance: ${account.balance.toFixed(2)} ${account.currency}</p>
        <p class="account-server">Profit: <strong style="color: ${profitColor};"><small style="font-size: 0.7em;">U$S</small> ${currentProfit.toFixed(0)}</strong></p> 
        <p class="account-server">Rendimiento: <strong class="account-balance" style="color: ${profitColor};">${performancePercentage}%</strong></p>`;

    accountCard.appendChild(accountContent);

    const logoContainer = document.createElement('div');
    logoContainer.classList.add('logo-container');
    
    const platformInfo = document.createElement('div');
    platformInfo.classList.add('platform-info');
    const platformImgSrc = `img/${account.platform ? account.platform.toLowerCase() : 'mt5_logo'}.png`;
    const platformAltText = `${account.platform || 'Plataforma desconocida'} logo`;
    platformInfo.innerHTML = `<img src="${platformImgSrc}" alt="${platformAltText}" class="platform-logo">`;
    logoContainer.appendChild(platformInfo);
    
    const fundingInfo = document.createElement('div');
    fundingInfo.classList.add('funding-info');
    const fundingImgSrc = `img/${account.fundingCompany ? account.fundingCompany.toLowerCase() : 'wsf_logo'}.png`;
    const fundingAltText = `${account.fundingCompany || 'Empresa desconocida'} logo`;
    fundingInfo.innerHTML = `<img src="${fundingImgSrc}" alt="${fundingAltText}" class="funding-logo">`;
    logoContainer.appendChild(fundingInfo);
    
    accountCard.appendChild(logoContainer);
    accountPairContainer.appendChild(accountCard);

    const calendarContainer = document.createElement('div');
    calendarContainer.classList.add('mini-calendar-container');
    initMiniCalendar(calendarContainer, account.trades);
    accountPairContainer.appendChild(calendarContainer);

    const middleContentContainer = document.createElement('div');
    middleContentContainer.classList.add('middle-content-container');

    const chartCanvas = document.createElement('canvas');
    chartCanvas.id = `accountChart-${account.account}`;
    chartCanvas.width = 460; // Dimensiones iniciales (Chart.js las ajustará con responsive: true)
    chartCanvas.height = 300;
    middleContentContainer.appendChild(chartCanvas);

    accountPairContainer.appendChild(middleContentContainer);

    const tradesContainer = document.createElement('div');
    tradesContainer.classList.add('trades-container');
    tradesContainer.style.display = 'none'; // Oculto por defecto

    if (account.trades && account.trades.length > 0) {
        const tradesTable = document.createElement('table');
        tradesTable.classList.add('trades-table');
        tradesTable.innerHTML = `
            <thead>
                <tr>
                    <th>Ticket</th>
                    <th>Símbolo</th>
                    <th>Tipo</th>
                    <th>Volumen</th>
                    <th>Apertura</th>
                    <th>Cierre</th>
                    <th>Ganancia</th>
                    <th>Fecha</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        `;
        const tbody = tradesTable.querySelector('tbody');

        account.trades.forEach(trade => {
            const row = document.createElement('tr');
            const profitClass = trade.profit < 0 ? 'negative-profit' : 'positive-profit';
            const formattedProfit = trade.profit.toFixed(2);

            row.innerHTML = `
                <td>${trade.ticket}</td>
                <td>${trade.symbol}</td>
                <td>${trade.type}</td>
                <td>${trade.volume.toFixed(2)}</td>
                <td>${trade.open_price.toFixed(5)}</td>
                <td>${trade.close_price.toFixed(5)}</td>
                <td class="${profitClass}">${formattedProfit}</td>
                <td>${trade.date}</td>
            `;
            tbody.appendChild(row);
        });
        tradesContainer.appendChild(tradesTable);
    } else {
        const noTradesMessage = document.createElement('p');
        noTradesMessage.textContent = 'No hay operaciones para esta cuenta en el mes actual.';
        noTradesMessage.classList.add('no-trades-message');
        tradesContainer.appendChild(noTradesMessage);
    }

    accountPairContainer.appendChild(tradesContainer);

    // Event listener para mostrar/ocultar la tabla de operaciones
    accountCard.addEventListener('click', () => {
        tradesContainer.style.display = tradesContainer.style.display === 'none' ? 'block' : 'none';
        accountCard.classList.toggle('expanded');
    });

    // Renderizar la gráfica de rendimiento de la cuenta
    renderAccountChart(chartCanvas, account.trades);

    return accountPairContainer;
}
