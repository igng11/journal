// miniCalendar.js

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/**
 * Inicializa y renderiza un mini-calendario para una cuenta específica.
 * @param {HTMLElement} containerElement El elemento DOM donde se insertará el calendario.
 * @param {Array<Object>} accountTrades El array de operaciones (trades) para esta cuenta.
 */
export function initMiniCalendar(containerElement, accountTrades) {
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    // Crear la estructura HTML del calendario (título, botones, grid)
    const calendarHeader = document.createElement('div');
    calendarHeader.classList.add('mini-calendar-header');
    calendarHeader.innerHTML = `
        <button class="mini-prev-month"><i class="fas fa-chevron-left"></i></button>
        <div class="mini-calendar-title"></div>
        <button class="mini-next-month"><i class="fas fa-chevron-right"></i></button>
    `;

    const calendarGrid = document.createElement('div');
    calendarGrid.classList.add('mini-calendar-grid');

    containerElement.appendChild(calendarHeader);
    containerElement.appendChild(calendarGrid);

    const titleElement = calendarHeader.querySelector('.mini-calendar-title');
    const prevButton = calendarHeader.querySelector('.mini-prev-month');
    const nextButton = calendarHeader.querySelector('.mini-next-month');

    // Función para renderizar el calendario
    function renderCalendar() {
        calendarGrid.innerHTML = ''; // Limpiar el grid antes de renderizar
        titleElement.textContent = `${monthNames[currentMonth].substring(0, 3)} ${currentYear.toString().slice(-2)}`;

        // Calcular ganancias/pérdidas netas por día para el mes actual
        const dailyNetProfits = new Map();
        accountTrades.forEach(trade => {
            const tradeDate = new Date(trade.date + 'T00:00:00Z'); // Forzar UTC
            if (tradeDate.getUTCFullYear() === currentYear && tradeDate.getUTCMonth() === currentMonth) {
                const dayOfMonth = tradeDate.getUTCDate();
                const profit = trade.profit;
                dailyNetProfits.set(dayOfMonth, (dailyNetProfits.get(dayOfMonth) || 0) + profit);
            }
        });

        // Añadir nombres de los días de la semana
        for (let i = 0; i < dayNames.length; i++) {
            const dayNameCell = document.createElement("div");
            dayNameCell.classList.add("mini-calendar-day-name");
            dayNameCell.textContent = dayNames[i];
            calendarGrid.appendChild(dayNameCell);
        }

        let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        firstDayOfMonth = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; // Ajuste para Lunes como primer día

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        let day = 1;
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDayOfMonth) {
                    const emptyCell = document.createElement("div");
                    calendarGrid.appendChild(emptyCell);
                } else if (day > daysInMonth) {
                    break;
                } else {
                    const dayCell = document.createElement("div");
                    dayCell.classList.add("mini-calendar-day");
                    dayCell.textContent = day;

                    // Resaltar días con operaciones (verdes para ganancias, rojos para pérdidas)
                    if (dailyNetProfits.has(day)) {
                        const netProfit = dailyNetProfits.get(day);
                        if (netProfit < 0) {
                            dayCell.classList.add("lost-day");
                        } else {
                            dayCell.classList.add("traded-day");
                        }
                    }

                    calendarGrid.appendChild(dayCell);
                    day++;
                }
            }
            if (day > daysInMonth) {
                break;
            }
        }
    }

    // Función para cambiar el mes
    function changeMonth(offset) {
        currentMonth += offset;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(); // Volver a renderizar el calendario con el nuevo mes
    }

    // Añadir event listeners a los botones de navegación
    prevButton.addEventListener('click', () => changeMonth(-1));
    nextButton.addEventListener('click', () => changeMonth(1));

    // Renderizar el calendario por primera vez al inicializarse
    renderCalendar();
}