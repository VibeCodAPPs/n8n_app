# Script para limpiar contenedores y resolver conflictos de puerto
# Ejecutar este script si tienes problemas con el puerto 5678

Write-Host "=== Limpieza de contenedores n8n ===" -ForegroundColor Cyan

# Detener contenedores específicos
Write-Host "`nDeteniendo contenedores n8n..." -ForegroundColor Yellow
docker stop n8n_Server 2>$null
docker stop n8n_postgres 2>$null

# Eliminar contenedores
Write-Host "Eliminando contenedores..." -ForegroundColor Yellow
docker rm n8n_Server 2>$null
docker rm n8n_postgres 2>$null

# Limpiar redes
Write-Host "Limpiando redes de Docker..." -ForegroundColor Yellow
docker network prune -f

# Verificar si el puerto 5678 está libre
Write-Host "`nVerificando puerto 5678..." -ForegroundColor Yellow
$portCheck = netstat -ano | Select-String ":5678"
if ($portCheck) {
    Write-Host "ADVERTENCIA: El puerto 5678 todavía está en uso:" -ForegroundColor Red
    Write-Host $portCheck -ForegroundColor Red
    Write-Host "`nPuedes encontrar el proceso con:" -ForegroundColor Yellow
    Write-Host "netstat -ano | findstr :5678" -ForegroundColor White
} else {
    Write-Host "✓ Puerto 5678 está libre" -ForegroundColor Green
}

# Mostrar contenedores activos
Write-Host "`nContenedores Docker activos:" -ForegroundColor Yellow
docker ps

Write-Host "`n=== Limpieza completada ===" -ForegroundColor Green
Write-Host "Ahora puedes ejecutar: docker compose up -d" -ForegroundColor Cyan
