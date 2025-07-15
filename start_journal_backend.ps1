# Ruta al ejecutable pm2.cmd
$pm2Path = "C:\Users\Usuario\AppData\Roaming\npm\pm2.cmd"

# Ejecutar pm2 resurrect
# Si encuentras errores, también podrías intentar "$pm2Path startup" seguido de "$pm2Path resurrect"
# O incluso "$pm2Path start C:\Users\Usuario\Desktop\Journal\server.js --name JournalBackend"
# Sin embargo, pm2 resurrect es lo más limpio si pm2 save funciona.
& $pm2Path resurrect | Out-File "C:\Users\Usuario\Desktop\Journal\pm2_startup_log.txt" -Append