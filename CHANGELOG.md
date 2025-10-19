# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [2.0.0] - 2025-10-19

### 🚀 Características Principales

#### Agregadas
- **Detección automática de contenedores Docker** - Encuentra todos los contenedores n8n sin importar el nombre
- **Conexión a la nube** - Conecta a n8n Cloud e instancias self-hosted remotas
- **Selector visual moderno** - Interfaz intuitiva con diseño responsivo para elegir servidor
- **Gestión de múltiples conexiones** - Sistema de configuración persistente para guardar conexiones
- **Reconexión automática** - Se conecta automáticamente a la última conexión exitosa
- **Control avanzado de contenedores** - Inicia, detiene y reinicia contenedores desde la interfaz
- **Menú de gestión** - Cambia entre conexiones sin reiniciar la aplicación
- **Validación de URLs remotas** - Verifica que las instancias remotas sean accesibles antes de conectar
- **Detección dinámica de puertos** - Detecta automáticamente el puerto mapeado del contenedor
- **Soporte modo oscuro/claro** - Interfaz adaptable al tema del sistema

#### Archivos Nuevos
- `launcher/renderer/connection-selector.html` - Selector de conexión interactivo
- `launcher/config.example.json` - Ejemplo de archivo de configuración
- `PRD_CONTAINER_DETECTION.md` - Documentación de diseño e implementación
- `IMPLEMENTATION_SUMMARY.md` - Resumen técnico de la implementación
- `CHANGELOG.md` - Historial de cambios
- `launcher/main-old.js` - Backup de la versión 1.0.0

#### Cambiadas
- **Reescritura completa de `launcher/main.js`** - Nueva arquitectura modular
- **README.md** - Actualizado con nuevas características y guía de migración
- **launcher/README.md** - Documentación técnica ampliada con casos de uso
- **.gitignore** - Agregado `launcher/config.json` y `launcher/main-old.js`
- **launcher/package.json** - Versión actualizada a 2.0.0

#### Técnicas
- Implementación de IPC handlers para comunicación Electron
  - `list-docker-containers` - Lista contenedores n8n
  - `list-remote-connections` - Lista conexiones remotas guardadas
  - `get-config` - Obtiene configuración actual
  - `add-remote-connection` - Agrega nueva conexión remota
  - `delete-connection` - Elimina una conexión
  - `start-container` - Inicia un contenedor Docker
  - `restart-container` - Reinicia un contenedor Docker
  - `connect-to-server` - Conecta a servidor seleccionado
- Sistema de gestión de configuración con funciones: `loadConfig()`, `saveConfig()`, `generateId()`
- Funciones de Docker mejoradas: `listN8nContainers()`, `startContainer()`, `stopContainer()`, `restartContainer()`
- Validación de URLs con `validateN8nURL()` usando waitOn
- Nuevo sistema de ventanas: `createMainWindow()`, `createSelectorWindow()`
- Menú dinámico que se actualiza según el tipo de conexión activa

### 🔧 Mejoras de UX
- Interfaz responsive con diseño moderno
- Badges visuales de estado (Running/Stopped/Remote)
- Acciones inline con botones contextuales
- Indicadores de carga (spinners)
- Mensajes de error descriptivos con troubleshooting
- Checkbox para habilitar/deshabilitar auto-reconexión
- Animaciones y transiciones suaves

### 🐛 Correcciones
- Eliminados nombres de contenedores hardcodeados
- Removida configuración manual de rutas en código
- Mejorado manejo de errores con mensajes específicos
- Corregida detección de puertos en conflicto

### 🔄 Breaking Changes
- Ya no se requiere configurar `N8N_CWD` manualmente (se detecta automáticamente)
- Los nombres de contenedores hardcodeados (`n8n_Server`, `n8n_postgres`) fueron eliminados
- El archivo `config.json` reemplaza la configuración en código
- Primera ejecución ahora muestra selector de conexión en lugar de conectar automáticamente

### 📦 Compatibilidad
- ✅ Contenedores Docker con cualquier nombre
- ✅ Docker Compose
- ✅ Contenedores standalone
- ✅ n8n Cloud (*.app.n8n.cloud)
- ✅ n8n self-hosted remoto
- ✅ Detección automática de puertos personalizados
- ✅ Windows 10/11

### 🔐 Seguridad
- `config.json` agregado a .gitignore (no se sube al repositorio)
- Validación de URLs antes de conectar
- No se almacenan credenciales en config.json

### 📚 Documentación
- Historial de versiones agregado a README.md
- Guía de migración desde v1.0.0
- Tabla comparativa de versiones
- Casos de uso detallados
- Roadmap de futuras versiones
- PRD completo de la implementación
- Resumen técnico de la arquitectura

---

## [1.0.0] - Anterior

### Características Iniciales
- Lanzador básico para n8n con Docker Desktop
- Configuración hardcodeada en `main.js`
- Nombres de contenedores fijos: `n8n_Server`, `n8n_postgres`
- Inicia/detiene contenedores con docker-compose
- Pantalla de carga simple
- Selector de temas (Sistema/Claro/Oscuro)
- Ejecutable portable con electron-builder
- Scripts auxiliares PowerShell para gestión de Docker

### Limitaciones
- Solo funcionaba con contenedores de nombre específico
- No soportaba conexiones remotas
- Requería editar código para cambiar configuración
- Sin gestión de múltiples instancias
- Sin selector visual
- Configuración manual de rutas

---

[2.0.0]: https://github.com/tu-usuario/App_N8N/releases/tag/v2.0.0
[1.0.0]: https://github.com/tu-usuario/App_N8N/releases/tag/v1.0.0
