// constants.js

// Nombres de meses y días para calendarios o displays de fecha
export const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
export const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Colores unificados basados en tus clases CSS para gráficas y elementos de UI
export const COLORS = {
    // Colores para elementos positivos (ganancias, win rate)
    GREEN_DARK: 'rgb(58, 124, 74)', // Color de texto verde oscuro para .traded-day
    GREEN_LIGHT_OPAQUE: 'rgb(185, 250, 233, 0.8)', // Color de fondo verde claro de .traded-day con opacidad
    GREEN_LIGHT_SOLID: 'rgb(185, 250, 233, 1)', // Color de fondo verde claro de .traded-day sin opacidad (para hover)

    // Colores para elementos negativos (pérdidas, loss rate)
    RED_DARK: 'rgb(209, 90, 102)', // Color de texto rojo oscuro para .lost-day
    RED_LIGHT_OPAQUE: 'rgb(252, 217, 202, 0.8)', // Color de fondo rojo claro de .lost-day con opacidad
    RED_LIGHT_SOLID: 'rgb(252, 217, 202, 1)', // Color de fondo rojo claro de .lost-day sin opacidad (para hover)

    // Colores generales para texto y errores
    GRAY_TEXT: '#666',
    ERROR_RED: 'red'
};

// URL de la API (si cambia, solo se modifica aquí)
export const API_URL = 'http://localhost:3005/data';
export const API_REGENERATE_URL = 'http://localhost:3005/api/regenerate-data';
