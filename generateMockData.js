// generateMockData.js

import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// --- Configuración de directorios ---
const CTRADER_REPORTS_DIR = './ctrader_reports';
const MT5_REPORTS_DIR = './mt5_reports';

// --- Función principal para generar mockData (modificada para retornar datos) ---
async function generateMockData() {
    const allParsedAccounts = [];

    // --- Lógica de cTrader ---
    console.log(`Buscando archivos .htm en: ${CTRADER_REPORTS_DIR}`);
    let ctraderHtmlFiles = [];
    try {
        ctraderHtmlFiles = fs.readdirSync(CTRADER_REPORTS_DIR).filter(file => path.extname(file).toLowerCase() === '.htm');
    } catch (error) {
        console.warn(`No se pudo leer el directorio ${CTRADER_REPORTS_DIR}. Omitiendo archivos cTrader.`, error.message);
    }

    for (const fileName of ctraderHtmlFiles) {
        const filePath = path.join(CTRADER_REPORTS_DIR, fileName);
        console.log(`Procesando archivo cTrader: ${filePath}`);
        try {
            const htmlContent = fs.readFileSync(filePath, 'utf8');
            const parsedAccount = parseCtraderHtml(htmlContent);
            allParsedAccounts.push(parsedAccount);
        } catch (error) {
            console.error(`Error al procesar el archivo cTrader ${fileName}:`, error.message);
            console.error(error);
        }
    }

    // --- Lógica de MT5 ---
    console.log(`\nBuscando archivos .html en: ${MT5_REPORTS_DIR}`);
    let mt5HtmlFiles = [];
    try {
        mt5HtmlFiles = fs.readdirSync(MT5_REPORTS_DIR).filter(file => path.extname(file).toLowerCase() === '.html' || path.extname(file).toLowerCase() === '.htm');
    } catch (error) {
        console.warn(`No se pudo leer el directorio ${MT5_REPORTS_DIR}. Omitiendo archivos MT5.`, error.message);
    }

    for (const fileName of mt5HtmlFiles) {
        const filePath = path.join(MT5_REPORTS_DIR, fileName);
        console.log(`Procesando archivo MT5: ${filePath}`);
        try {
            const htmlContent = fs.readFileSync(filePath, 'utf16le'); 
            const parsedAccount = parseMt5Html(htmlContent);
            allParsedAccounts.push(parsedAccount);
        } catch (error) {
            console.error(`Error al procesar el archivo MT5 ${fileName}:`, error.message);
            console.error(error);
        }
    }

    const finalMockData = {
        mt5_accounts: allParsedAccounts 
    };

    console.log(`\n¡${allParsedAccounts.length} cuenta(s) procesada(s) exitosamente desde ambas plataformas!!`);
    console.log(`Datos listos para ser usados por el servidor.`);
    
    // RETORNA los datos en lugar de escribirlos a un archivo
    return finalMockData;
}

// Exporta la función para que pueda ser importada en server.js
export { generateMockData };

// --- Código de las funciones parseCtraderHtml y parseMt5Html (con cambios para initialBalance) ---

function parseCtraderHtml(htmlString) {
    const dom = new JSDOM(htmlString);
    const doc = dom.window.document;

    const accountData = {};
    accountData.trades = [];
    accountData.platform = "cTrader"; 
    accountData.fundingCompany = "WSF"; 

    const accountNumberElement = doc.evaluate('//td[contains(normalize-space(.), "Cuenta :")]/following-sibling::td/strong', doc, null, dom.window.XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (accountNumberElement) {
        accountData.account = accountNumberElement.textContent.trim();
        accountData.name = `cTrader Cuenta ${accountData.account}`;
    } else {
        console.warn("No se pudo encontrar el número de cuenta en el HTML de cTrader. Usando 'Desconocida_cTrader'.");
        accountData.account = 'Desconocida_cTrader';
        accountData.name = 'cTrader Cuenta Desconocida';
    }

    const currencyElement = doc.evaluate('//td[contains(normalize-space(.), "Divisa :")]/following-sibling::td/strong', doc, null, dom.window.XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (currencyElement) {
        accountData.currency = currencyElement.textContent.trim();
    } else {
        console.warn(`[${accountData.account}] No se pudo encontrar la divisa en el HTML de cTrader. Usando 'USD'.`);
        accountData.currency = 'USD'; 
    }

    const balanceElement = doc.querySelector('.summaryTable .balance-style nobr');
    if (balanceElement) {
        accountData.balance = parseFloat(balanceElement.textContent.trim().replace(/\s/g, '').replace(',', '.'));
        accountData.equity = accountData.balance; 
    } else {
        console.warn(`[${accountData.account}] No se pudo encontrar el balance/equity en el HTML de cTrader. Usando 0.`);
        accountData.balance = 0;
        accountData.equity = 0;
    }

    accountData.server = 'cTrader Server'; 
    accountData.leverage = 0; 

    // --- INICIO DEL BLOQUE DE EXTRACCIÓN DE initialBalance (MODIFICADO) ---
    accountData.initialBalance = 10000; // Valor por defecto inicial, se sobrescribirá si se encuentra

    // Estrategia: Buscar el valor de "Depósito" en la tabla de Resumen
    // Usamos normalize-space() para manejar espacios extra y &nbsp;
    const depositValueElement = doc.evaluate(
        '//table[@class="summaryTable"]//tr[td/nobr[normalize-space(.)="Depósito"]]/td[@class="summary-style"]/nobr',
        doc, null, dom.window.XPathResult.FIRST_ORDERED_NODE_TYPE, null
    ).singleNodeValue;

    if (depositValueElement) {
        const valueText = depositValueElement.textContent.trim();
        const parsedValue = parseFloat(valueText.replace(/\s/g, '').replace(',', '.'));
        
        if (!isNaN(parsedValue)) {
            accountData.initialBalance = parsedValue;
            console.log(`[${accountData.account}] ✅ Balance inicial (Depósito en Resumen) encontrado: ${accountData.initialBalance}`);
        } else {
            console.warn(`[${accountData.account}] ⚠️ Valor de depósito encontrado pero no es un número válido: "${valueText}".`);
        }
    } else {
        console.warn(`[${accountData.account}] ❌ Celda de 'Depósito' en tabla de resumen no encontrada.`);
    }

    // Si después de la búsqueda principal, initialBalance sigue siendo el valor por defecto
    // o si la cuenta no tiene trades aún (lo que indicaría que el reporte es muy temprano)
    if (accountData.initialBalance === 10000 && accountData.trades.length === 0) {
        console.warn(`[${accountData.account}] ⚠️ No se encontró un balance inicial explícito y no hay trades. Usando el valor por defecto: ${accountData.initialBalance}.`);
    } else if (accountData.initialBalance === 10000 && accountData.trades.length > 0) {
        // Fallback: Si no se encontró un balance inicial explícito pero hay trades, inferir
        const sortedTrades = [...accountData.trades].sort((a, b) => new Date(a.date) - new Date(b.date));
        let totalProfit = 0;
        sortedTrades.forEach(trade => {
            totalProfit += trade.profit;
        });
        accountData.initialBalance = accountData.balance - totalProfit;
        console.warn(`[${accountData.account}] 💡 Balance inicial inferido de las operaciones (Fallback): ${accountData.initialBalance.toFixed(2)}`);
    }
    // --- FIN DEL BLOQUE DE EXTRACCIÓN DE initialBalance ---

    const historyTable = doc.evaluate('//strong[contains(normalize-space(.), "Historial")]/ancestor::table[1]', doc, null, dom.window.XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (historyTable) {
        const tradeRows = Array.from(historyTable.querySelectorAll('tr')).filter(row => {
            return row.querySelector('.cell-text');
        });

        if (tradeRows.length === 0) {
            console.warn(`[${accountData.account}] No se encontraron filas de trades en la tabla de historial de cTrader.`);
        }

        tradeRows.forEach((row, rowIndex) => {
            const cells = Array.from(row.querySelectorAll('.cell-text nobr')); 
            
            if (cells.length >= 7) { 
                const trade = {};
                trade.symbol = cells[0]?.textContent.trim() || '';
                trade.type = cells[1]?.textContent.trim() || '';

                const dateTimeString = cells[2]?.textContent.trim() || '';
                const [datePart] = dateTimeString.split(' ');
                const [day, month, year] = datePart.split('/');
                trade.date = `${year}-${month}-${day}`; 

                trade.open_price = parseFloat(cells[3]?.textContent.trim().replace(',', '.') || '0');
                trade.close_price = parseFloat(cells[4]?.textContent.trim().replace(',', '.') || '0');

                const volumeText = cells[5]?.textContent.trim() || '0 Lotes';
                trade.volume = parseFloat(volumeText.replace(' Lotes', '').replace(',', '.'));

                trade.profit = parseFloat(cells[6]?.textContent.trim().replace(/\s/g, '').replace(',', '.') || '0');
                
                trade.ticket = `${accountData.account}-CTR-${trade.date.replace(/-/g, '')}-${rowIndex + 1}`; 

                accountData.trades.push(trade);
            } else {
                console.warn(`[${accountData.account}] Fila de cTrader con menos de 7 celdas. Saltando fila.`);
            }
        });
    } else {
        console.warn(`[${accountData.account}] No se encontró la tabla de historial de trades en el HTML de cTrader.`);
    }

    return accountData;
}

// ... (El resto de tu generateMockData.js, incluyendo parseMt5Html, permanece SIN CAMBIOS) ...


function parseMt5Html(htmlString) {
    const dom = new JSDOM(htmlString);
    const doc = dom.window.document;

    const accountData = {};
    accountData.trades = [];
    accountData.platform = "MT5"; 
    accountData.fundingCompany = "WSF"; // Valor por defecto

    let accountLabelTh = null;
    const allThElements = Array.from(doc.querySelectorAll('th'));
    allThElements.forEach((th) => {
        const text = th.textContent.trim();
        if (text === "Cuenta de trading:") { 
            accountLabelTh = th;
        }
    });

    if (accountLabelTh) { 
        const bElement = accountLabelTh.nextElementSibling?.querySelector('b');

        if (bElement) {
            const fullAccountInfo = bElement.textContent.trim();
            const matches = fullAccountInfo.match(/^(\d+)\s*\(([^,]+),\s*([^,]+)(?:,\s*[^)]*)?\)/); 

            if (matches && matches.length >= 4) {
                accountData.account = matches[1];
                accountData.currency = matches[2];
                accountData.server = matches[3];
                accountData.name = `MT5 Cuenta ${accountData.account}`;
            } else {
                console.warn(`[${accountData.account || 'Desconocida_MT5'}] No se pudo parsear la información de la cuenta MT5.`);
                accountData.account = fullAccountInfo.split(' ')[0] || 'Desconocida_MT5';
                accountData.currency = 'USD'; 
                accountData.server = 'MT5 Server'; 
                accountData.name = `MT5 Cuenta ${accountData.account}`;
            }
        } else {
            console.warn("No se pudo encontrar la información de la cuenta de trading en el HTML de MT5.");
            accountData.account = 'Desconocida_MT5';
            accountData.name = 'MT5 Cuenta Desconocida';
            accountData.currency = 'USD';
            accountData.server = 'MT5 Server';
        }
    } else {
        console.warn("No se pudo encontrar la etiqueta 'Cuenta de trading:' en el HTML de MT5. Usando valores por defecto.");
        accountData.account = 'Desconocida_MT5';
        accountData.name = 'MT5 Cuenta Desconocida';
        accountData.currency = 'USD';
        accountData.server = 'MT5 Server';
    }

    const balanceElement = doc.evaluate('//td[contains(normalize-space(.), "Balance:")]/following-sibling::td[1]/b', doc, null, dom.window.XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    const equityElement = doc.evaluate('//td[contains(normalize-space(.), "Patrimonio:")]/following-sibling::td[1]/b', doc, null, dom.window.XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (balanceElement) {
        accountData.balance = parseFloat(balanceElement.textContent.trim().replace(/\s/g, '').replace(',', '.'));
    } else {
        console.warn(`[${accountData.account}] No se pudo encontrar el balance en el HTML de MT5. Usando 0.`);
        accountData.balance = 0;
    }

    if (equityElement) {
        accountData.equity = parseFloat(equityElement.textContent.trim().replace(/\s/g, '').replace(',', '.'));
    } else {
        console.warn(`[${accountData.account}] No se pudo encontrar el patrimonio (equity) en el HTML de MT5. Usando el balance o 0.`);
        accountData.equity = accountData.balance || 0;
    }

    accountData.leverage = 0;

    // --- CAMBIO CLAVE para MT5: Extracción de initialBalance ---
    // En los reportes de MT5, el balance inicial suele aparecer en la tabla de resumen financiero
    // o puede inferirse del primer 'depósito' en el historial de transacciones (si está disponible).
    // Buscamos la fila "Depósito/Retiro" en la tabla de "Beneficio/Pérdida"
    const depositWithdrawalRow = doc.evaluate(
        '//table[.//th[contains(normalize-space(.), "Beneficio/Pérdida")]][1]//tr[td[contains(normalize-space(.), "Depósito/Retiro")]]/td[2]/b', 
        doc, null, dom.window.XPathResult.FIRST_ORDERED_NODE_TYPE, null
    ).singleNodeValue;

    if (depositWithdrawalRow) {
        // En MT5, 'Depósito/Retiro' a menudo muestra la cantidad neta depositada inicialmente.
        // Si hay varios depósitos/retiros, esta lógica podría necesitar ser más compleja.
        accountData.initialBalance = parseFloat(depositWithdrawalRow.textContent.trim().replace(/\s/g, '').replace(',', '.'));
        console.log(`[${accountData.account}] Balance inicial (Depósito/Retiro) encontrado en MT5: ${accountData.initialBalance}`);
    } else {
        // Fallback: Si no se encuentra un depósito explícito, intenta buscar un "Balance inicial"
        const initialBalanceSummaryElement = doc.evaluate(
            '//td[contains(normalize-space(.), "Balance inicial:")]/following-sibling::td[1]/b', 
            doc, null, dom.window.XPathResult.FIRST_ORDERED_NODE_TYPE, null
        ).singleNodeValue;

        if (initialBalanceSummaryElement) {
            accountData.initialBalance = parseFloat(initialBalanceSummaryElement.textContent.trim().replace(/\s/g, '').replace(',', '.'));
            console.log(`[${accountData.account}] Balance inicial (Resumen) encontrado en MT5: ${accountData.initialBalance}`);
        } else {
            // Último recurso: si no se encuentra un balance inicial ni depósitos, infiere de las trades.
            if (accountData.trades.length > 0) {
                const sortedTrades = [...accountData.trades].sort((a, b) => new Date(a.date) - new Date(b.date));
                let totalProfit = 0;
                sortedTrades.forEach(trade => {
                    totalProfit += trade.profit;
                });
                accountData.initialBalance = accountData.balance - totalProfit;
                console.warn(`[${accountData.account}] Balance inicial inferido de las operaciones de MT5: ${accountData.initialBalance.toFixed(2)}`);
            } else {
                // Si no hay trades y no se encontró initialBalance, asumimos un valor por defecto.
                accountData.initialBalance = 10000; 
                console.warn(`[${accountData.account}] No se pudo encontrar el balance inicial de MT5 ni inferirlo de las operaciones. Usando valor por defecto: ${accountData.initialBalance}.`);
            }
        }
    }
    // Fin CAMBIO CLAVE para MT5

    const tradesHistoryTable = doc.evaluate(
        '//table[.//th[contains(normalize-space(.), "Posiciones") and not(@colspan="1")]][1]',
        doc,
        null,
        dom.window.XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;

    if (!tradesHistoryTable) {
        console.warn(`[${accountData.account}] No se encontró la tabla de "Posiciones" (historial) en el HTML de MT5.`);
    }

    if (tradesHistoryTable) {
        const tradeRows = Array.from(tradesHistoryTable.querySelectorAll('tr[bgcolor="#FFFFFF"], tr[bgcolor="#F7F7F7"]'));

        if (tradeRows.length === 0) {
            console.warn(`[${accountData.account}] No se encontraron filas de trades en la tabla de "Posiciones" (Historial) en el HTML de MT5.`);
        }

        tradeRows.forEach((row) => {
            const cells = Array.from(row.querySelectorAll('td'));

            if (cells.length >= 14) { 
                const tradeType = cells[3]?.textContent.trim().toLowerCase();
                const statusIndicator = cells[4]?.textContent.trim().toLowerCase(); 
                const closeTimeValue = cells[9]?.textContent.trim(); 
                const profitCell = cells[13]; 

                if (
                    (tradeType === 'buy' || tradeType === 'sell') && 
                    statusIndicator === '' && 
                    closeTimeValue && 
                    profitCell?.textContent.trim() !== ''
                ) {
                    const trade = {};
                    
                    const openDateTimeString = cells[0]?.textContent.trim() || '';
                    const [openDatePart] = openDateTimeString.split(' ');
                    const [openYear, openMonth, openDay] = openDatePart.split('.');
                    trade.date = `${openYear}-${openMonth}-${openDay}`; 

                    trade.ticket = cells[1]?.textContent.trim() || '';
                    trade.symbol = cells[2]?.textContent.trim() || '';
                    trade.type = tradeType; 

                    trade.volume = parseFloat(cells[5]?.textContent.trim().replace(',', '.') || '0'); 
                    trade.open_price = parseFloat(cells[8]?.textContent.trim().replace(',', '.') || '0'); 
                    trade.close_price = parseFloat(cells[10]?.textContent.trim().replace(',', '.') || '0'); 
                    trade.profit = parseFloat(profitCell?.textContent.trim().replace(/\s/g, '').replace(',', '.') || '0'); 
                    
                    accountData.trades.push(trade);
                }
            }
        });
    }

    return accountData;
}
