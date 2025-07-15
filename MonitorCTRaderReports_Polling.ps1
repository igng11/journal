# MonitorCTRaderReports_Polling.ps1 - ¡Tu versión mejorada con limpieza por cuenta y movimiento!

# --- CONFIGURACIÓN ---
# Ruta donde cTrader guarda los reportes (ORIGEN)
$sourceFolder = "C:\Users\Usuario\Documents\cTrader\Statements\Spotware"

# Ruta donde quieres que se guarden en tu proyecto (DESTINO)
$destinationFolder = "C:\Users\Usuario\Desktop\Journal\ctrader_reports"

# Intervalo de verificación (en segundos)
$checkIntervalSeconds = 10 # Cada cuánto tiempo el script revisará la carpeta de origen

# --- Configuración de Logs ---
$logFolderPath = "C:\Users\Usuario\Desktop\Journal\ctrader_reports\logs" 
$mainTranscriptLog = Join-Path $logFolderPath "ctrader_monitor_log_polling.txt" 
$eventActionLog = Join-Path $logFolderPath "ctrader_polling_events.log"        

# --- NUEVA CONFIGURACIÓN: Expresión Regular para Número de Cuenta ---
# Este patrón busca "cT_" seguido por un grupo de dígitos (\d+) y lo captura como el número de cuenta.
# Ejemplo: Para un archivo 'cT_4003855_2025-07-05_21-15.htm', capturará '4003855'.
$accountNumberRegex = '^cT_(\d+)_.*\.htm$'


# Asegúrate de que la carpeta de logs exista
if (-not (Test-Path $logFolderPath)) {
    try {
        New-Item -Path $logFolderPath -ItemType Directory -ErrorAction Stop | Out-Null
        "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): Carpeta de logs '$logFolderPath' creada." | Out-File $eventActionLog -Append
    } catch {
        "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): ERROR crítico: No se pudo crear la carpeta de logs '$logFolderPath'. Mensaje: $($_.Exception.Message)" | Out-File "C:\Temp\monitor_critical_error_polling.log" -Append
        exit 1 
    }
}

# Iniciar transcripción de la sesión de PowerShell
try {
    Start-Transcript -Path $mainTranscriptLog -Append -Force -ErrorAction Stop
    Write-Output "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): DEBUG: Script de monitoreo (polling) iniciado y transcripción activa."
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): DEBUG: Transcripción iniciada con éxito para polling." | Out-File $eventActionLog -Append 
} catch {
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): ERROR crítico: No se pudo iniciar Start-Transcript (polling). Mensaje: $($_.Exception.Message)" | Out-File $eventActionLog -Append
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): ERROR crítico: No se pudo iniciar Start-Transcript (polling). Mensaje: $($_.Exception.Message)" | Out-File "C:\Temp\monitor_critical_error_polling.log" -Append 
    exit 1 
}

# Asegúrate de que la carpeta de destino exista
if (-not (Test-Path $destinationFolder)) {
    try {
        New-Item -Path $destinationFolder -ItemType Directory -ErrorAction Stop | Out-Null
        "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): Carpeta de destino '$destinationFolder' creada." | Out-File $eventActionLog -Append
        Write-Output "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): Carpeta de destino creada: $destinationFolder"
    } catch {
        "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): ERROR: No se pudo crear la carpeta de destino '$destinationFolder'. Mensaje: $($_.Exception.Message)" | Out-File $eventActionLog -Append
        Write-Output "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): ERROR: No se pudo crear la carpeta de destino '$destinationFolder'. Mensaje: $($_.Exception.Message)"
        exit 1 
    }
}

Write-Output "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): Monitoreando la carpeta de origen: $sourceFolder cada $checkIntervalSeconds segundos."
Write-Output "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): Los archivos se MOVERÁN y se LIMPIARÁN por cuenta en: $destinationFolder"
"$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): DEBUG: Iniciando bucle de polling." | Out-File $eventActionLog -Append

# Bucle principal de polling
while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp DEBUG: Realizando verificación de nuevos archivos en '$sourceFolder'." | Out-File $eventActionLog -Append

    try {
        # Obtener todos los archivos .htm en la carpeta de origen
        $sourceFiles = Get-ChildItem -Path $sourceFolder -Filter "*.htm" -File -ErrorAction SilentlyContinue

        foreach ($file in $sourceFiles) {
            # --- Paso 1: Extraer el número de cuenta del nombre del archivo ---
            # El regex $accountNumberRegex busca un patrón en el nombre del archivo.
            # $matches[1] contendrá el número de cuenta si se encuentra.
            $accountNumber = $null
            if ($file.Name -match $accountNumberRegex) {
                $accountNumber = $matches[1]
                "$timestamp INFO: Archivo detectado: '$($file.Name)'. Cuenta: '$accountNumber'." | Out-File $eventActionLog -Append
            } else {
                "$timestamp ADVERTENCIA: No se pudo extraer el número de cuenta de '$($file.Name)'. Este archivo será copiado, pero no se aplicará la limpieza por cuenta." | Out-File $eventActionLog -Append
            }

            # --- Paso 2: Construir la ruta de destino para el archivo actual ---
            $destinationFilePath = Join-Path $destinationFolder $file.Name

            # --- Paso 3: Limpiar la carpeta de destino: Eliminar reportes antiguos de la misma cuenta ---
            # Esto asegura que solo la última versión del reporte de esta cuenta quede en el destino.
            if ($accountNumber) {
                # Buscar todos los archivos existentes en el destino para esta misma cuenta
                # El filtro usa la cuenta detectada y el patrón de nombre de archivo de cTrader.
                $existingAccountFiles = Get-ChildItem -Path $destinationFolder -Filter "cT_${accountNumber}_*.htm" -File -ErrorAction SilentlyContinue

                if ($existingAccountFiles.Count -gt 0) {
                    "$timestamp INFO: Se encontraron $($existingAccountFiles.Count) reportes existentes para la cuenta '$accountNumber' en destino. Eliminando para reemplazar por el nuevo..." | Out-File $eventActionLog -Append
                    foreach ($existingFile in $existingAccountFiles) {
                        try {
                            Remove-Item -Path $existingFile.FullName -Force -ErrorAction Stop
                            "$timestamp DEBUG: Reporte antiguo eliminado: '$($existingFile.Name)'." | Out-File $eventActionLog -Append
                        } catch {
                            "$timestamp ERROR: Fallo al eliminar reporte antiguo '$($existingFile.Name)'. Mensaje: $($_.Exception.Message)." | Out-File $eventActionLog -Append
                        }
                    }
                }
            } else {
                 "$timestamp DEBUG: No se detectó número de cuenta para limpieza previa. Copiando '$($file.Name)' directamente." | Out-File $eventActionLog -Append
            }

            # --- Paso 4: Copiar el archivo nuevo al destino ---
            # Ya que eliminamos las versiones anteriores, podemos copiar este directamente.
            "$timestamp INFO: Iniciando copia de '$($file.Name)' a '$destinationFilePath'." | Out-File $eventActionLog -Append
            Start-Sleep -Seconds 1 # Pequeño retraso para asegurar que cTrader haya terminado de escribir el archivo.

            try {
                Copy-Item -Path $file.FullName -Destination $destinationFilePath -Force -ErrorAction Stop
                "$timestamp INFO: Archivo '$($file.Name)' copiado exitosamente a: '$destinationFilePath'." | Out-File $eventActionLog -Append

                # --- Paso 5: Eliminar el archivo de origen después de una copia exitosa ---
                try {
                    Remove-Item -Path $file.FullName -Force -ErrorAction Stop
                    "$timestamp INFO: Archivo '$($file.Name)' ELIMINADO de la carpeta de origen: '$sourceFolder'." | Out-File $eventActionLog -Append

                } catch {
                    "$timestamp ERROR: Fallo al ELIMINAR '$($file.Name)' del origen. Mensaje: $($_.Exception.Message)." | Out-File $eventActionLog -Append
                }

            } catch {
                "$timestamp ERROR: Fallo al COPIAR '$($file.Name)'. No se eliminará del origen. Mensaje: $($_.Exception.Message)." | Out-File $eventActionLog -Append
            }
        }
    } catch {
        "$timestamp ERROR: Fallo general durante la verificación o copia (Polling). Mensaje: $($_.Exception.Message)." | Out-File $eventActionLog -Append
    }

    # Esperar el intervalo antes de la siguiente verificación
    Start-Sleep -Seconds $checkIntervalSeconds
}