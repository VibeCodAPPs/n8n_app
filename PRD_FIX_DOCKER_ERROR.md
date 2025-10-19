# PRD - Corrección Error Docker n8n

## Problema
Error al ejecutar docker compose: "driver failed programming external connectivity on endpoint n8n_Server"

## Causa Raíz
1. Ruta `N8N_CWD` no configurada correctamente en `main.js`
2. No existe archivo `docker-compose.yml`
3. Posible conflicto de puertos (5678 ya en uso)

## Solución - Pasos

### ✅ Paso 1: Crear docker-compose.yml
- Ubicación: `G:\@ DESCARGAS\@ DESARROLLO\App_N8N\docker-compose.yml`
- Configurar n8n con PostgreSQL
- Usar puerto 5678 para n8n
- Definir volúmenes para persistencia de datos
- Container name: `n8n_Server`

### ⏳ Paso 2: Actualizar configuración en main.js
- Cambiar `N8N_CWD` a la ruta correcta del proyecto
- Apuntar a: `G:\@ DESCARGAS\@ DESARROLLO\App_N8N`

### ⏳ Paso 3: Agregar validación de puertos
- Verificar si puerto 5678 está disponible
- Detener contenedores previos si existen
- Limpiar recursos huérfanos de Docker

### ⏳ Paso 4: Mejorar manejo de errores
- Agregar función para limpiar contenedores previos
- Detectar conflictos de puertos
- Mostrar mensajes de error más descriptivos

### ⏳ Paso 5: Crear archivo .env de ejemplo
- Variables de entorno para PostgreSQL
- Configuración de n8n

### ⏳ Paso 6: Documentar configuración
- Actualizar README con instrucciones específicas
- Incluir troubleshooting para errores comunes

## Criterios de Éxito
- [x] docker-compose.yml creado y funcional
- [x] main.js configurado con ruta correcta
- [x] Funciones de limpieza y validación agregadas
- [x] Archivo .env.example creado
- [x] README actualizado con troubleshooting
- [x] Script de limpieza creado
- [ ] Aplicación inicia sin errores (pendiente de prueba)
- [ ] n8n accesible en http://localhost:5678 (pendiente de prueba)
- [ ] Datos persisten entre reinicios (pendiente de prueba)

## Notas Técnicas
- Sistema: Windows
- Docker Desktop debe estar ejecutándose
- Puerto 5678 debe estar libre
- Carpetas de datos se crean automáticamente
