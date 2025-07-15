let riesgoSeleccionado = null; // Variable global para almacenar el riesgo seleccionado

function calcularLotaje() {
    console.log('¡Botón Calcular Lotaje clickeado!');
    const accountSizeSelect = document.getElementById('account-size');
    const riskTable = document.querySelector('.risk-table');
    const stopLossPipsInput = document.getElementById('stop-loss-pips');
    const riskUsdSpan = document.getElementById('risk-usd');
    const lotSizeSpan = document.getElementById('lot-size');

    console.log('accountSizeSelect:', accountSizeSelect);
    console.log('riskTable:', riskTable);
    console.log('stopLossPipsInput:', stopLossPipsInput);
    console.log('riskUsdSpan:', riskUsdSpan);
    console.log('lotSizeSpan:', lotSizeSpan);
    console.log('Riesgo seleccionado (al calcular):', riesgoSeleccionado);

    if (riesgoSeleccionado === null) {
        alert('Por favor, selecciona un porcentaje de riesgo de la tabla.');
        return;
    }

    const accountSize = parseFloat(accountSizeSelect.value);
    const stopLossPips = parseInt(stopLossPipsInput.value);

    console.log('Tamaño de la cuenta:', accountSize);
    console.log('Stop Loss (Pips):', stopLossPips);

    if (isNaN(accountSize) || isNaN(riesgoSeleccionado) || isNaN(stopLossPips) || stopLossPips <= 0) {
        alert('Por favor, selecciona un tamaño de cuenta, un porcentaje de riesgo de la tabla y un stop loss en pips válido.');
        return;
    }

    const riskAmountUsd = accountSize * riesgoSeleccionado;
    console.log('Riesgo en USD calculado:', riskAmountUsd);
    riskUsdSpan.textContent = `${riskAmountUsd.toFixed(2)}`;

    const pipValue = 0.1;
    const lotSize = riskAmountUsd / (stopLossPips * pipValue);
    console.log('Tamaño del lote calculado:', lotSize);
    lotSizeSpan.textContent = `${lotSize.toFixed(2)}`;
}

// NO document.addEventListener('DOMContentLoaded') AQUÍ
// Los listeners se añadirán desde app.js