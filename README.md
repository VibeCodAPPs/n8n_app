# n8n Desktop App - Launcher Universal

**Versión 2.0.0** - Launcher universal con detección automática y conexión a la nube

Aplicación de escritorio para Windows que te permite conectarte a instancias de n8n, ya sean locales (Docker) o remotas (nube).

## ✨ Características

- 🐳 **Detección automática** de contenedores Docker n8n locales
- ☁️ **Conexión a la nube** - Conecta a instancias remotas de n8n
- 🔄 **Gestión de múltiples conexiones** - Guarda y administra diferentes servidores
- ⚡ **Reconexión automática** - Se conecta automáticamente a tu última conexión
- 🎨 **Selector visual** - Interfaz moderna para elegir tu servidor
- 🔧 **Control de contenedores** - Inicia, detiene y reinicia contenedores desde la app

## 📋 Requisitos Previos

- Windows 10/11
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (solo para contenedores locales)
- Node.js 16+ (solo para desarrollo del launcher)

## 🚀 Inicio Rápido

### 📦 Descarga del Ejecutable (Recomendado)

#### Para Usuarios Finales:

**Opción 1: Descarga desde GitHub Releases**
1. Ve a la [página de Releases](https://github.com/tu-usuario/App_N8N/releases)
2. Descarga **`n8n Launcher 2.0.0.exe`** de la última versión
3. Ejecuta el archivo descargado
4. La primera vez verás el selector de conexión

**Opción 2: Compilar desde Código Fuente**
```powershell
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/App_N8N.git
cd App_N8N/launcher

# 2. Instalar dependencias
npm install

# 3. Compilar ejecutable
npm run build

# 4. El ejecutable estará en:
# launcher\dist\n8n Launcher 2.0.0.exe
```

**📍 Ubicación del ejecutable:**
```
App_N8N/
└── launcher/
    └── dist/
        └── n8n Launcher 2.0.0.exe  ← Ejecutable compilado
```

### 🐳 Configuración de Docker (Para Contenedores Locales)

Si quieres usar contenedores Docker locales:

1. **Copiar archivo de configuración:**
   ```bash
   copy .env.example .env
   ```
   
2. **Iniciar Docker Desktop** (asegúrate de que esté completamente iniciado)

3. **Probar manualmente con Docker Compose:**
   ```bash
   docker compose up -d
   ```
   
4. **Verificar que funciona:**
   - Abre tu navegador en `http://localhost:5678`
   - Deberías ver la interfaz de n8n

5. **Detener los contenedores:**
   ```bash
   docker compose down
   ```

### Usar el Launcher de Electron

1. **Navegar a la carpeta launcher:**
   ```bash
   cd launcher
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

4. **Primera vez - Seleccionar conexión:**
   - La app mostrará un selector con todas las opciones disponibles
   - **Contenedores locales**: Se detectan automáticamente
   - **Conexión remota**: Ingresa la URL de tu n8n en la nube
   - Marca "Reconectar automáticamente" para no ver el selector cada vez

5. **Compilar ejecutable (opcional):**
   ```bash
   npm run build
   ```
   El ejecutable estará en `launcher/dist/n8n Launcher 2.0.0.exe`

## 🔌 Tipos de Conexión

### Conexión Local (Docker)

La app detecta automáticamente todos los contenedores Docker que ejecuten n8n:
- Muestra el nombre del contenedor
- Indica si está corriendo o detenido
- Permite iniciarlo con un clic
- Detecta automáticamente el puerto

### Conexión Remota (Nube)

Conecta a instancias de n8n alojadas en la nube:
- n8n Cloud (`https://tu-workspace.app.n8n.cloud`)
- n8n self-hosted en servidor remoto
- Cualquier instancia de n8n accesible por URL

**Ejemplo de conexión remota:**
1. Abre el selector de conexión
2. En "Nueva Conexión Personalizada":
   - Nombre: `Mi n8n Cloud`
   - URL: `https://mi-workspace.app.n8n.cloud`
3. Clic en "Guardar"
4. Selecciona la conexión y clic en "Conectar"

## 📁 Estructura del Proyecto

```
App_N8N/
├── docker-compose.yml          # Configuración de Docker para n8n + PostgreSQL
├── .env.example                # Variables de entorno de ejemplo
├── .env                        # Variables de entorno (crear desde .example)
├── n8n-data/                   # Datos de n8n (se crea automáticamente)
├── postgres-data/              # Datos de PostgreSQL (se crea automáticamente)
├── start-n8n.ps1               # Script para iniciar n8n con Docker
├── cleanup-docker.ps1          # Script para limpiar contenedores
└── launcher/                   # Aplicación Electron
    ├── main.js                 # Lógica principal del launcher
    ├── config.json             # Configuración y conexiones guardadas (se crea automáticamente)
    ├── package.json            # Configuración del proyecto
    ├── renderer/               # Interfaz de usuario
    │   ├── index.html          # Pantalla de carga
    │   └── connection-selector.html  # Selector de conexión
    └── README.md               # Documentación del launcher
```

## 🔧 Configuración

### Variables de Entorno (Solo Docker Local)

Edita el archivo `.env` para personalizar tu instalación local:

```env
POSTGRES_USER=n8n
POSTGRES_PASSWORD=n8n_password
POSTGRES_DB=n8n
N8N_HOST=localhost
GENERIC_TIMEZONE=America/Mexico_City
```

### Gestión de Conexiones

El launcher guarda tus conexiones en `launcher/config.json`:

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
      "url": "http://localhost:5678"
    },
    {
      "id": "conn_def456",
      "name": "n8n Cloud Production",
      "type": "remote",
      "url": "https://mi-n8n.app.n8n.cloud"
    }
  ]
}
```

### Cambiar Conexión

Desde el menú de la app:
- **Conexión > Cambiar servidor n8n...** - Abre el selector
- **Conexión > Reiniciar contenedor actual** - Reinicia el contenedor Docker actual

## 🐛 Solución de Problemas

### Error: "driver failed programming external connectivity"

**Causa:** Puerto 5678 ya está en uso.

**Solución rápida:**
```bash
docker ps -a
docker stop n8n_Server n8n_postgres
docker rm n8n_Server n8n_postgres
docker network prune -f
```

### Limpiar Todo y Empezar de Nuevo

```bash
# Detener y eliminar contenedores
docker compose down

# Eliminar volúmenes (ADVERTENCIA: Esto borra todos los datos)
docker compose down -v

# Limpiar todo Docker
docker system prune -a --volumes -f

# Iniciar de nuevo
docker compose up -d
```

### Verificar Estado de los Contenedores

```bash
# Ver contenedores activos
docker ps

# Ver logs de n8n
docker logs n8n_Server

# Ver logs de PostgreSQL
docker logs n8n_postgres

# Seguir logs en tiempo real
docker logs -f n8n_Server
```

### Acceder a la Base de Datos

```bash
docker exec -it n8n_postgres psql -U n8n -d n8n
```

## 📚 Recursos

- [Documentación oficial de n8n](https://docs.n8n.io/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Electron](https://www.electronjs.org/)

## 🔒 Seguridad

- El archivo `.env` está en `.gitignore` por seguridad
- El archivo `config.json` no se sube al repositorio (contiene tus conexiones)
- No subas credenciales a repositorios públicos
- Cambia las contraseñas por defecto en producción

## 📝 Notas

- Los datos se persisten en las carpetas `n8n-data/` y `postgres-data/`
- Al cerrar el launcher con conexión Docker, el contenedor se detiene automáticamente
- Las conexiones remotas no se detienen al cerrar la app
- Para eliminar completamente los datos: `docker compose down -v`

---

## 📋 Historial de Versiones

### v2.0.0 - Launcher Universal (2025-10-19)

**🚀 Características Principales:**
- ✨ **Detección automática de contenedores Docker** - Encuentra todos los contenedores n8n sin importar el nombre
- ☁️ **Conexión a la nube** - Conecta a n8n Cloud e instancias remotas
- 🎨 **Selector visual moderno** - Interfaz intuitiva para elegir servidor
- 🔄 **Gestión de múltiples conexiones** - Guarda y administra diferentes servidores
- ⚡ **Reconexión automática** - Se conecta automáticamente a la última conexión exitosa
- 🔧 **Control de contenedores** - Inicia, detiene y reinicia desde la app
- 📱 **Menú de gestión** - Cambia entre conexiones sin reiniciar

**Cambios Técnicos:**
- Reescritura completa de `launcher/main.js`
- Nueva pantalla: `launcher/renderer/connection-selector.html`
- Sistema de configuración persistente: `launcher/config.json`
- IPC handlers para comunicación con selector
- Detección dinámica de puertos
- Validación de URLs remotas

**Archivos Nuevos:**
- `launcher/renderer/connection-selector.html` - Selector de conexión
- `launcher/config.example.json` - Ejemplo de configuración
- `PRD_CONTAINER_DETECTION.md` - Documentación de implementación
- `IMPLEMENTATION_SUMMARY.md` - Resumen técnico
- `launcher/main-old.js` - Backup de versión anterior

**Mejoras de UX:**
- Interfaz responsive con modo oscuro/claro
- Badges visuales de estado (Running/Stopped/Remote)
- Acciones inline (Iniciar, Reiniciar, Eliminar)
- Indicadores de carga
- Mensajes de error descriptivos
- Checkbox para auto-reconexión
- **Fix de barra de tareas de Windows** - El icono anclado ahora se agrupa correctamente (App User Model ID)

**Compatibilidad:**
- ✅ Contenedores Docker con cualquier nombre
- ✅ Docker Compose
- ✅ Contenedores standalone
- ✅ n8n Cloud (*.app.n8n.cloud)
- ✅ n8n self-hosted remoto
- ✅ Detección automática de puertos personalizados

**Breaking Changes:**
- Ya no se requiere configurar `N8N_CWD` manualmente
- Los nombres de contenedores hardcodeados fueron eliminados
- El archivo `config.json` reemplaza la configuración en código

---

### v1.0.0 - Release Inicial (Anterior)

**Características:**
- Lanzador básico para n8n con Docker Desktop
- Configuración hardcodeada en `main.js`
- Nombres de contenedores fijos: `n8n_Server`, `n8n_postgres`
- Inicia/detiene contenedores con docker-compose
- Pantalla de carga simple
- Selector de temas (Sistema/Claro/Oscuro)
- Ejecutable portable

**Limitaciones:**
- Solo funcionaba con contenedores de nombre específico
- No soportaba conexiones remotas
- Requería editar código para cambiar configuración
- Sin gestión de múltiples instancias
- Sin selector visual

**Archivos:**
- `launcher/main.js` (versión básica)
- `launcher/renderer/index.html`
- `docker-compose.yml`
- Scripts auxiliares PowerShell

---

## 🔄 Migración desde v1.0.0 a v2.0.0

Si estabas usando la versión anterior:

1. **Backup de tu configuración anterior** (opcional):
   ```powershell
   # El código anterior está respaldado en main-old.js
   ```

2. **Primera ejecución de v2.0.0**:
   - La app mostrará el selector de conexión
   - Tus contenedores existentes serán detectados automáticamente
   - Selecciona tu contenedor y marca "Reconectar automáticamente"

3. **Nueva configuración**:
   - Las preferencias ahora se guardan en `launcher/config.json`
   - Este archivo se crea automáticamente al usar la app
   - Está en `.gitignore` (no se sube al repo)

4. **Sin cambios en Docker**:
   - Tu `docker-compose.yml` sigue funcionando igual
   - Tus datos en `n8n-data/` y `postgres-data/` se mantienen
   - Los scripts PowerShell (`start-n8n.ps1`, `cleanup-docker.ps1`) siguen funcionando

5. **Nuevas capacidades**:
   - Ahora puedes agregar conexiones remotas
   - Ya no necesitas editar código para cambiar configuración
   - Puedes gestionar múltiples instancias de n8n

**No hay pérdida de datos ni configuración de Docker.**

---

## 🆕 Comparación de Versiones

| Característica | v1.0.0 | v2.0.0 |
|----------------|--------|--------|
| Detección automática | ❌ | ✅ |
| Conexión remota | ❌ | ✅ |
| Múltiples conexiones | ❌ | ✅ |
| Selector visual | ❌ | ✅ |
| Configuración en código | ✅ | ❌ |
| Auto-reconexión | ❌ | ✅ |
| Control de contenedores | Básico | ✅ Avanzado |
| Gestión desde menú | ❌ | ✅ |
| Nombres hardcodeados | ✅ | ❌ |
| Cualquier nombre de contenedor | ❌ | ✅ |

---

## 💡 Roadmap Futuro (Posibles Mejoras)

Características consideradas para futuras versiones:

- **v2.1.0** (Planeado)
  - Export/Import de conexiones
  - Sincronización de config en la nube
  - Notificaciones del sistema
  - Logs integrados

- **v2.2.0** (En consideración)
  - Soporte para macOS
  - Soporte para Linux
  - Túneles SSH para conexiones remotas
  - Gestión de múltiples perfiles

- **v3.0.0** (Concepto)
  - Marketplace de workflows
  - Gestión de backups integrada
  - Monitor de salud de contenedores
  - Panel de administración multi-instancia
