**Proyecto Journal de Trading**

Este repositorio alberga una aplicación web para el registro y análisis de operaciones de trading. Consiste en un backend Node.js (Express) para datos y un frontend interactivo construido con HTML, CSS, y JavaScript modular, utilizando Chart.js para visualizaciones de datos.

*Estructura del Proyecto*

A continuación, se presenta un esquema de árbol de directorios que detalla la organización de los archivos y carpetas del proyecto..

├── .gitignore             # Configuración de Git para ignorar archivos/carpetas (ej. node_modules/).
├── MonitorCTRaderReports_Polling.ps1 # Script de PowerShell para monitoreo de reportes cTrader.
├── README.md              # Este archivo de documentación.
├── SVG/                   # Contiene assets SVG.
│   └── favicon.svg        # Icono SVG para el sitio.
├── accountRenderer.js     # Módulo JS para renderizar tarjetas de cuentas individuales.
├── app.js                 # Script cliente principal: inicializa la aplicación.
├── chartRenderers.js      # Módulo JS para encapsular la lógica de renderizado de gráficas Chart.js.
├── config.json            # Archivo de configuración del proyecto.
├── constants.js           # Módulo JS que centraliza constantes (nombres, colores, URLs de API).
├── ctrader_reports/       # Almacena reportes HTML y logs de cTrader.
│   ├── cT_4003855_2025-07-14_13-1
9.htm
│   ├── cT_4007654_2025-07-10_20-35.htm
│   ├── cT_4007739_2025-07-15_11-06.htm
│   ├── cT_4007740_2025-07-11_09-52.htm
│   └── logs/              # Logs específicos de cTrader.
│       ├── ctrader_monitor_log_polling.txt
│       └── ctrader_polling_events.log
├── dashboard.js           # Módulo principal del dashboard (en modularización, orquesta la visualización).
├── dashboardMetrics.js    # Módulo JS para calcular y renderizar métricas y gráficas globales del dashboard.
├── dashboard.js.bk        # Copia de seguridad del archivo dashboard.js.
├── fonts/                 # Contiene archivos de fuentes personalizadas.
│   └── montserrat/        # Archivos de la fuente Montserrat.
│       ├── Montserrat-Bold.ttf
│       ├── Montserrat-ExtraBold.ttf
│       ├── Montserrat-ExtraLight.ttf
│       ├── Montserrat-Light.ttf
│       ├── Montserrat-Medium.ttf
│       └── Montserrat-Regular.ttf
├── forexfactory.js        # Módulo JS relacionado con datos de Forex Factory.
├── generateMockData.js    # Lógica JS para generar datos simulados para el servidor.
├── img/                   # Contiene imágenes utilizadas en el frontend.
│   ├── choch+fvg.png
│   ├── ctrader.png
│   ├── equals.png
│   ├── favicon.ico
│   ├── icon_check.png
│   ├── intencionalidad.png
│   ├── mecha_liquida.png
│   ├── mt5.png
│   ├── temp.jpeg
│   ├── transferencia.png
│   └── wsf.png
├── index.html             # Página HTML principal de tu aplicación web.
├── minicalendar.js        # Módulo JS para la funcionalidad del mini-calendario.
├── mockData.js            # Archivo JS con datos mock (posiblemente usado por generateMockData.js).
├── mt5_reports/           # Almacena reportes y logs de MT5.
│   └── logs/              # Logs específicos de MT5.
├── nssm.exe               # Ejecutable NSSM (Non-Sucking Service Manager) para Windows Services.
├── package-lock.json      # Bloquea las versiones exactas de las dependencias de Node.js.
├── package.json           # Define el proyecto, scripts y dependencias de Node.js.
├── pages/                 # Contiene archivos HTML para diferentes secciones o páginas de la aplicación.
│   ├── calendar.css       # Hoja de estilos para la página de calendario.
│   ├── calendar.html      # Página HTML del calendario.
│   ├── dashboard.html     # Página HTML del dashboard.
│   ├── forexfactory.html  # Página HTML de Forex Factory.
│   ├── mindset.html       # Página HTML de mindset.
│   └── risk.html          # Página HTML de gestión de riesgo.
├── pm2_startup_log.txt    # Log de inicio de PM2.
├── postcss.config.cjs     # Configuración de PostCSS.
├── risk.js                # Módulo JS relacionado con la gestión de riesgo.
├── server.js              # Backend principal (Express): sirve archivos estáticos y maneja APIs.
├── server_logs/           # Logs del servidor.
│   └── server-output.log  # Salida de logs del servidor.
├── start_journal_backend.ps1 # Script de PowerShell para iniciar el backend.
├── style.css              # Hojas de estilo CSS principales de tu aplicación.
├── tailwind.config.cjs    # Configuración de Tailwind CSS.
├── tailwind.css           # Archivo CSS generado por Tailwind.
├── uiUtils.js             # Módulo JS para utilidades de UI (obtener elementos, mostrar estados).
└── utils.js               # Módulo JS de utilidades generales (posiblemente obsoleto o a refactorizar).

*Explicación de las Carpetas y Archivos Clave:*

Archivos en la Raíz: Tu proyecto organiza muchos archivos de frontend (.js, .css, .html) directamente en la carpeta raíz, junto con los archivos del backend y de configuración.
accountRenderer.js: Módulo JavaScript dedicado a la lógica de renderizado de las tarjetas de cuentas individuales en el dashboard.
app.js: El script principal del lado del cliente que inicializa la aplicación y maneja la carga de los módulos del dashboard.
chartRenderers.js: Módulo JavaScript que encapsula la lógica de renderizado de los diferentes tipos de gráficas de Chart.js utilizadas en el dashboard.
constants.js: Módulo JavaScript que centraliza todas las constantes de la aplicación, como nombres, colores y URLs de la API, para una gestión más sencilla.
dashboard.js: El módulo principal del dashboard, que ahora actúa como orquestador, delegando la creación de UI y el renderizado de gráficas a otros módulos.
dashboardMetrics.js: Un nuevo módulo JavaScript que contiene la lógica para calcular y renderizar las métricas y gráficas globales del dashboard (Win Rate, Actividad Diaria, Track Record Global).
img/: Contiene las imágenes utilizadas en el frontend (logos, iconos, etc.).
index.html: La página HTML principal que carga toda la aplicación web.
minicalendar.js: Un módulo JavaScript dedicado a la funcionalidad de los mini-calendarios que se muestran en las tarjetas de cuenta.
pages/: Esta carpeta contiene archivos HTML y CSS para diferentes secciones o "páginas" de tu aplicación, sugiriendo una estructura multipágina o de secciones cargadas.
server.js: Tu script principal del backend que usa Express para servir archivos estáticos y manejar las rutas API.
style.css: Contiene las hojas de estilo CSS principales para el diseño y la apariencia de la aplicación.
uiUtils.js: Módulo JavaScript que contiene funciones de utilidad para la interacción con el DOM y la gestión del estado visual de la interfaz de usuario (mensajes de carga, errores, etc.).
utils.js: Un módulo de utilidades generales. Dado que constants.js y uiUtils.js han tomado responsabilidades, este archivo podría ser revisado para ver si su contenido puede ser refactorizado o si es redundante.

*Cómo Ejecutar el Proyecto*

Para ejecutar este proyecto, asegúrate de tener Node.js y npm (o yarn) instalados.Navega al directorio raíz del proyecto en tu terminal.Instala las dependencias del backend:npm install
# o
yarn install
Inicia el servidor Node.js:node server.js
# o si usas pm2 (asegúrate de que pm2 esté instalado globalmente):
pm2 start pm2.config.js
Abre tu navegador y ve a http://localhost:3005

¡Esperamos que esta documentación actualizada te sea de gran utilidad!