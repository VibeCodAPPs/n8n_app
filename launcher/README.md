# n8n App Launcher Universal (Windows)

Lanzador de escritorio moderno que te permite conectarte a cualquier instancia de n8n, ya sea local (Docker) o remota (nube).

## Características

- 🐳 **Detección automática de contenedores Docker** - Encuentra todos los contenedores n8n sin importar el nombre
- ☁️ **Conexión a la nube** - Conéctate a n8n Cloud o instancias self-hosted remotas
- 🔄 **Gestión de múltiples conexiones** - Guarda y administra diferentes servidores n8n
- ⚡ **Reconexión automática** - Se conecta automáticamente a tu última conexión exitosa
- 🎨 **Selector visual moderno** - Interfaz intuitiva para elegir tu servidor
- 🔧 **Control de contenedores** - Inicia, detiene y reinicia contenedores desde la app
- 🌓 **Temas** - Sistema, Claro u Oscuro (por defecto)
- 📦 **Ejecutable portable** - Un solo archivo EXE sin instalación

## Requisitos

- Windows 10/11
- Docker Desktop (solo para contenedores locales)
- Docker Compose v2 (`docker compose`) (solo para contenedores locales)
- Para conexiones remotas: URL de tu instancia de n8n

## Desarrollo

```bash
# En la carpeta launcher del proyecto
npm install
npm run dev
```

### Primera Ejecución

Al ejecutar la app por primera vez, verás el **selector de conexión** con:

1. **Contenedores Docker Locales** - Detectados automáticamente
   - Muestra nombre, estado (Running/Stopped) y puerto
   - Puedes iniciar contenedores detenidos con un clic
   
2. **Conexiones en la Nube** - Tus conexiones remotas guardadas
   - n8n Cloud (https://tu-workspace.app.n8n.cloud)
   - Instancias self-hosted remotas
   
3. **Nueva Conexión Personalizada** - Agregar manualmente
   - Nombre: Identifica tu conexión
   - URL: http:// o https:// de tu instancia n8n

## Build

```bash
# Genera el icono a partir de N8n--Streamline-Simple-Icons.png y crea el EXE portable
npm run build
```

- Portable: `dist/n8n Launcher 1.0.0.exe`
- (Si prefieres instalador, cambia "win.target" a "nsis" en `package.json` y ejecuta `npm run build`).

## Estructura

```
launcher/
├─ main.js                      # Lógica principal (detección, conexiones, Docker, tema)
├─ config.json                  # Configuración del usuario (se crea automáticamente)
├─ config.example.json          # Ejemplo de configuración
├─ package.json                 # Configuración y scripts de build
├─ renderer/
│  ├─ index.html                # Pantalla de carga
│  └─ connection-selector.html  # Selector de conexión interactivo
└─ scripts/
   └─ build-icon.js             # Convierte PNG -> ICO (256x256)
```

## Casos de Uso

### Uso 1: Desarrollador con contenedor local

1. Tienes un contenedor n8n corriendo localmente
2. Abres la app
3. La app detecta tu contenedor automáticamente
4. Seleccionas y te conectas

### Uso 2: Usuario de n8n Cloud

1. Tienes una cuenta en n8n.cloud
2. Abres la app
3. Agregas nueva conexión:
   - Nombre: "Mi n8n Cloud"
   - URL: https://tu-workspace.app.n8n.cloud
4. La app guarda la conexión
5. Próximas veces se reconecta automáticamente

### Uso 3: Múltiples entornos

1. Tienes:
   - Contenedor local de desarrollo
   - n8n Cloud de staging
   - n8n self-hosted de producción
2. Agregas todas las conexiones
3. Cambias entre ellas desde el menú: Conexión > Cambiar servidor n8n

## Configuración

### config.json

El archivo se crea automáticamente y guarda:

```json
{
  "version": "1.0",
  "autoConnect": true,           // Reconectar automáticamente
  "lastUsed": "conn_abc123",     // ID de última conexión
  "connections": [
    {
      "id": "conn_abc123",
      "name": "n8n Local Dev",
      "type": "docker",
      "containerId": "a1b2c3d4",
      "url": "http://localhost:5678"
    },
    {
      "id": "conn_def456",
      "name": "n8n Cloud Prod",
      "type": "remote",
      "url": "https://prod.app.n8n.cloud"
    }
  ]
}
```

### Rutas y Constantes

- `N8N_CWD`: Se configura automáticamente al directorio padre
- `DOCKER_DESKTOP`: `C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe`
- `CONFIG_PATH`: `launcher/config.json`

## Notas

- El icono se genera desde `../n8n/N8n--Streamline-Simple-Icons.png` (o tu imagen PNG de 256x256) y se guarda en `launcher/build/icon.ico`.
- **Las conexiones se guardan localmente** en `config.json` (no se sincronizan)
- La app detiene contenedores Docker al cerrar (solo si es conexión local)
- Las conexiones remotas no se detienen al cerrar la app

## Troubleshooting

### Error: "driver failed programming external connectivity on endpoint n8n_Server"

**Causa:** Puerto 5678 ya está en uso por otro proceso o contenedor.

**Soluciones:**

1. **Detener contenedores existentes:**
   ```bash
   docker ps -a
   docker stop n8n_Server n8n_postgres
   docker rm n8n_Server n8n_postgres
   ```

2. **Limpiar redes de Docker:**
   ```bash
   docker network prune -f
   ```

3. **Verificar qué proceso usa el puerto 5678:**
   ```bash
   netstat -ano | findstr :5678
   ```
   Luego detén el proceso o cambia el puerto en `docker-compose.yml`

4. **Reiniciar Docker Desktop completamente:**
   - Cierra Docker Desktop
   - Abre el Administrador de tareas y finaliza todos los procesos de Docker
   - Inicia Docker Desktop nuevamente

### Error: "Docker no estuvo listo en el tiempo esperado"

**Causa:** Docker Desktop no se inició correctamente.

**Soluciones:**
- Verifica que Docker Desktop esté instalado en `C:\Program Files\Docker\Docker\Docker Desktop.exe`
- Inicia Docker Desktop manualmente y espera a que esté completamente iniciado
- Revisa los logs de Docker Desktop

### Error: "Puerto 5678 ya está en uso"

**Solución rápida:**
```bash
# Detener todos los contenedores
docker stop $(docker ps -aq)

# Limpiar contenedores detenidos
docker container prune -f

# Limpiar redes
docker network prune -f
```

### La aplicación no se conecta a n8n

1. Verifica que los contenedores estén corriendo:
   ```bash
   docker ps
   ```
   Deberías ver `n8n_Server` y `n8n_postgres`

2. Revisa los logs:
   ```bash
   docker logs n8n_Server
   docker logs n8n_postgres
   ```

3. Prueba acceder directamente en el navegador:
   ```
   http://localhost:5678
   ```

### Problemas de permisos con volúmenes

Si tienes errores de permisos con las carpetas `n8n-data` o `postgres-data`:
- Asegúrate de que las carpetas existan y tengas permisos de escritura
- En Docker Desktop, ve a Settings > Resources > File Sharing y agrega la ruta del proyecto

### Cambiar el puerto de n8n

Si necesitas usar otro puerto (ej: 8080):

1. Edita `docker-compose.yml`:
   ```yaml
   ports:
     - "8080:5678"
   ```

2. Edita `launcher/main.js`:
   ```javascript
   const N8N_URL = "http://localhost:8080";
   ```
