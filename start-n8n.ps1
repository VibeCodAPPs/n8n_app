# Script de inicio rápido para n8n
# Este script verifica y prepara todo antes de iniciar n8n

Write-Host "=== Iniciando n8n con Docker ===" -ForegroundColor Cyan

# Verificar si Docker está ejecutándose
Write-Host "`nVerificando Docker Desktop..." -ForegroundColor Yellow
try {
    docker info >$null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker Desktop está ejecutándose" -ForegroundColor Green
    } else {
        throw "Docker no responde"
    }
} catch {
    Write-Host "✗ Docker Desktop NO está ejecutándose" -ForegroundColor Red
    Write-Host "Por favor inicia Docker Desktop y espera a que esté listo, luego ejecuta este script nuevamente." -ForegroundColor Yellow
    exit 1
}

# Verificar si existe .env
if (!(Test-Path ".env")) {
    Write-Host "`nArchivo .env no encontrado. Creando desde .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Archivo .env creado" -ForegroundColor Green
} else {
    Write-Host "✓ Archivo .env existe" -ForegroundColor Green
}

# Limpiar contenedores previos
Write-Host "`nLimpiando contenedores previos..." -ForegroundColor Yellow
docker stop n8n_Server 2>$null
docker stop n8n_postgres 2>$null
docker rm n8n_Server 2>$null
docker rm n8n_postgres 2>$null
docker network prune -f >$null 2>&1

# Verificar puerto
Write-Host "`nVerificando puerto 5678..." -ForegroundColor Yellow
$portCheck = netstat -ano | Select-String ":5678 "
if ($portCheck) {
    Write-Host "✗ ADVERTENCIA: Puerto 5678 está en uso" -ForegroundColor Red
    Write-Host $portCheck -ForegroundColor Red
    Write-Host "`nEjecuta cleanup-docker.ps1 o identifica y cierra el proceso que usa el puerto" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "✓ Puerto 5678 está libre" -ForegroundColor Green
}

# Iniciar contenedores
Write-Host "`nIniciando contenedores..." -ForegroundColor Yellow
docker compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Contenedores iniciados correctamente" -ForegroundColor Green
    
    Write-Host "`nEsperando a que n8n esté listo..." -ForegroundColor Yellow
    $maxAttempts = 30
    $attempt = 0
    $ready = $false
    
    while ($attempt -lt $maxAttempts -and -not $ready) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5678" -TimeoutSec 2 -UseBasicParsing 2>$null
            if ($response.StatusCode -eq 200) {
                $ready = $true
            }
        } catch {
            Start-Sleep -Seconds 2
            $attempt++
            Write-Host "." -NoNewline
        }
    }
    
    if ($ready) {
        Write-Host "`n`n✓ ¡n8n está listo!" -ForegroundColor Green
        Write-Host "`nAccede a n8n en: http://localhost:5678" -ForegroundColor Cyan
        Write-Host "`nPara ver logs: docker logs -f n8n_Server" -ForegroundColor Yellow
        Write-Host "Para detener: docker compose down" -ForegroundColor Yellow
        
        # Abrir en navegador (opcional)
        $openBrowser = Read-Host "`n¿Abrir en el navegador? (s/n)"
        if ($openBrowser -eq "s" -or $openBrowser -eq "S") {
            Start-Process "http://localhost:5678"
        }
    } else {
        Write-Host "`n✗ n8n no respondió en el tiempo esperado" -ForegroundColor Red
        Write-Host "Revisa los logs con: docker logs n8n_Server" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n✗ Error al iniciar contenedores" -ForegroundColor Red
    Write-Host "Revisa el error anterior y ejecuta cleanup-docker.ps1 si es necesario" -ForegroundColor Yellow
    exit 1
}
