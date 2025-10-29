# PRD: n8n Launcher v2.0.1

## 1. Objetivo
Consolidar las mejoras recientes del `n8n Launcher` para ofrecer una experiencia unificada cuando se conecta a instancias locales (Docker) o remotas (nube), asegurando persistencia de configuraciones, gestión simple de conexiones y estilo consistente con la marca n8n.

## 2. Resultado esperado
- Ventana inicial muestra lista de contenedores Docker (todos, no solo n8n) y conexiones remotas guardadas.
- Usuario puede agregar, eliminar y reconectar conexiones remotas con persistencia en `launcher/config.json`.
- Interfaz adopta el tema rosa-rojo característico de n8n y provee mensajes claros para estados de Docker.
- Ejecutable de Windows incluye dependencias críticas (e.g. `ffmpeg.dll`).

## 3. Alcance
- Actualizaciones de `launcher/main.js` y `launcher/renderer/connection-selector.html`.
- Incluye ajustes en `package.json` / `package-lock.json` para empaquetado correcto de DLLs.
- Documentación (`README.md`) reflejará nuevas capacidades y flujo de uso.

## 4. Requisitos funcionales
1. Detectar todos los contenedores Docker disponibles (estado, imagen, URL publicada).
2. Permitir agregar conexiones remotas validando URL `http(s)` y guardando en configuración.
3. Permitir eliminar conexiones remotas desde la UI con confirmación.
4. Guardar automáticamente los cambios en `config.json`.
5. Mostrar mensajes amigables cuando Docker Desktop no esté disponible e incluir botón "Recargar".
6. Construir ejecutable Windows con toda la librería DLL necesaria.

## 5. Requisitos no funcionales
- UI coherente con la marca n8n (`#ea4b71` - `#d5315b`).
- Tiempo de detección de Docker inferior a 5s usando `docker ps` antes de `docker info`.
- Build reproducible mediante `npm run build`.

## 6. Supuestos
- Usuario tiene Docker Desktop instalado (para contenedores locales).
- `config.json` se ubica junto al ejecutable dentro de `launcher/`.
- Conexiones remotas requieren URLs accesibles desde la máquina del usuario.

## 7. Riesgos y mitigaciones
- **Docker no disponible:** se muestran instrucciones y opción de recargar.
- **Dependencias faltantes en build:** se incluye carpeta `node_modules/**/*` y `extraFiles` para DLLs.
- **URLs inválidas:** validación en UI y en proceso principal.

## 8. Métricas de éxito
- Usuario puede agregar/eliminar conexiones remotas sin editar archivos manualmente.
- Ejecutable arranca sin errores de DLL.
- Feedback visual comunica claramente el estado de Docker y acciones disponibles.

## 9. Próximos pasos
- Preparar release en GitHub con binario actualizado.
- Evaluar empaquetado adicional (instalador NSIS) si se requiere instalación tradicional.
