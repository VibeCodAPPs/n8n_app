# PRD - Selector de Conexión n8n (Local & Nube)

## Problema Actual
La aplicación busca contenedores con nombres hardcodeados (`n8n_Server`, `n8n_postgres`). Si el usuario crea contenedores con otros nombres o quiere conectarse a una instancia remota, la app no lo permite.

## Solución Propuesta
Implementar un sistema flexible de conexión a n8n con las siguientes capacidades:
1. **Detectar contenedores locales**: Listar todos los contenedores Docker con n8n
2. **Conexión a la nube**: Permitir conectarse a instancias remotas de n8n
3. **Selector interactivo**: Mostrar diálogo de selección al iniciar la app
4. **Gestión de conexiones**: Guardar y administrar múltiples conexiones (locales y remotas)
5. **Conexión rápida**: Recordar última conexión usada

## Pasos de Implementación

### ✅ Paso 1: Crear sistema de gestión de conexiones
- ✓ `launcher/config.json` para guardar conexiones guardadas
- ✓ Estructura: { connections: [], lastUsed: null, autoConnect: true }
- ✓ Funciones: loadConfig(), saveConfig(), generateId()

### ✅ Paso 2: Crear funciones de detección de contenedores
- ✓ `listN8nContainers()` - Lista contenedores locales con imagen n8n
- ✓ `startContainer(containerId)` - Inicia un contenedor detenido
- ✓ `stopContainer(containerId)` - Detiene un contenedor
- ✓ `restartContainer(containerId)` - Reinicia un contenedor
- ✓ Extracción automática de puerto del contenedor

### ✅ Paso 3: Crear pantalla de selección de conexión
- ✓ Ventana modal de Electron (`connection-selector.html`)
- ✓ Interfaz moderna con diseño responsive
- ✓ Secciones implementadas:
  - **Contenedores Docker locales** (con estado y acciones)
  - **Conexiones guardadas en la nube**
  - **Nueva conexión personalizada** (con formulario)
- ✓ Botones: Conectar, Guardar, Eliminar, Iniciar/Reiniciar contenedores
- ✓ Soporte para modo oscuro/claro

### ✅ Paso 4: Implementar lógica de conexión
- ✓ Detectar si es conexión local (Docker) o remota (URL)
- ✓ Para local: verificar/iniciar contenedor si está detenido
- ✓ Para remota: validar que la URL sea accesible con waitOn
- ✓ Guardar última conexión exitosa en config.json
- ✓ Auto-guardar conexiones Docker usadas

### ✅ Paso 5: Actualizar menú de la aplicación
- ✓ Menú "Conexión" implementado con:
  - "Cambiar servidor n8n..."
  - "Reiniciar contenedor actual" (habilitado solo si es Docker)
  - "Crear contenedor con docker-compose"
- ✓ Menú "Ver" con temas y DevTools

### ✅ Paso 6: Mejorar UX y validaciones
- ✓ Badges visuales para estado (Running/Stopped/Remote)
- ✓ Validación de URL con validateN8nURL()
- ✓ Timeout de 10s para conexiones remotas
- ✓ Mensajes de error descriptivos
- ✓ Indicadores de carga (spinners)

### ✅ Paso 7: Actualizar documentación
- ✓ README principal actualizado
- ✓ launcher/README.md con casos de uso
- ✓ PRD con estructura completa de config.json
- ✓ Ejemplos de código y configuración
- ✓ .gitignore actualizado para excluir config.json

## Criterios de Éxito
- [x] La app detecta automáticamente contenedores n8n locales
- [x] Muestra selector con todas las opciones disponibles
- [x] Permite agregar conexiones remotas (nube)
- [x] Guarda y gestiona múltiples conexiones
- [x] Reconecta automáticamente a la última conexión exitosa
- [x] El usuario puede cambiar la conexión desde el menú
- [x] La app funciona con contenedores de cualquier nombre
- [x] Soporta instancias de n8n cloud y self-hosted remotas
- [x] Documentación actualizada

## ✅ IMPLEMENTACIÓN COMPLETADA

## Casos de Uso

### Caso 1: Primer inicio - Sin configuración previa
1. La app muestra pantalla de selección
2. Detecta contenedores Docker locales (si existen)
3. Muestra opción "Nueva conexión personalizada"
4. Usuario elige una opción y se guarda

### Caso 2: Usuario con contenedor local
1. App detecta contenedor(es) local(es)
2. Muestra lista con estado (Running/Stopped)
3. Si está detenido, ofrece iniciarlo
4. Usuario selecciona y se conecta

### Caso 3: Usuario con n8n en la nube
1. Usuario selecciona "Nueva conexión personalizada"
2. Ingresa URL: `https://mi-n8n.cloud.com`
3. App valida que sea accesible
4. Guarda la conexión para futuros usos

### Caso 4: Usuario con múltiples conexiones
1. App muestra selector con:
   - 2 contenedores locales
   - 1 conexión cloud guardada
   - Opción de agregar nueva
2. Usuario elige según necesidad
3. Última selección se marca como favorita

### Caso 5: Reconexión automática
1. App tiene `autoConnect: true` en config
2. Al iniciar, conecta automáticamente a `lastUsed`
3. Si falla, muestra selector
4. Usuario puede deshabilitar auto-conexión desde menú

### Caso 6: Gestión de conexiones
1. Usuario va a Menú > Conexión > Gestionar conexiones
2. Ve lista de todas las conexiones guardadas
3. Puede editar, eliminar o probar cada una
4. Puede marcar una como predeterminada

## Notas Técnicas

### Detección de Contenedores Locales
```bash
# Listar todos los contenedores n8n (corriendo y detenidos)
docker ps -a --filter ancestor=n8nio/n8n --format "{{.ID}}|{{.Names}}|{{.Status}}|{{.Ports}}"

# Obtener puerto de un contenedor
docker port <container_id> 5678
```

### Estructura de config.json
```json
{
  "version": "1.0",
  "autoConnect": true,
  "lastUsed": "conn_abc123",
  "connections": [
    {
      "id": "conn_abc123",
      "name": "n8n Local (Docker)",
      "type": "docker",
      "containerId": "a1b2c3d4",
      "containerName": "n8n_Server",
      "url": "http://localhost:5678",
      "lastConnected": "2025-10-19T02:00:00Z",
      "isFavorite": true
    },
    {
      "id": "conn_def456",
      "name": "n8n Cloud Production",
      "type": "remote",
      "url": "https://mi-n8n.app.n8n.cloud",
      "lastConnected": "2025-10-18T15:30:00Z",
      "isFavorite": false
    }
  ]
}
```

### Validación de URL Remota
```javascript
// Verificar que la URL sea accesible y sea una instancia de n8n
async function validateN8nURL(url) {
  try {
    const response = await fetch(url, { timeout: 5000 });
    // n8n debería redirigir o responder en la raíz
    return response.ok || response.status === 302;
  } catch {
    return false;
  }
}
```

### Soportar
- Contenedores Docker locales (cualquier nombre)
- Docker Compose
- Contenedores standalone
- n8n Cloud (https://*.app.n8n.cloud)
- n8n self-hosted remoto
- Detección de puerto dinámico
