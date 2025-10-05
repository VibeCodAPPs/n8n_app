# n8n App Launcher (Windows)

Lanzador de escritorio para ejecutar n8n en Docker Desktop y abrirlo en una ventana embebida (sin navegador).

## Características

- Verifica e inicia Docker Desktop automáticamente.
- Ejecuta `docker compose up -d` en tu carpeta de n8n.
- Espera a que n8n responda en `http://localhost:5678` y lo muestra dentro de la app.
- Al cerrar la app, detiene el contenedor (`docker compose stop` y fallback `docker stop n8n_Server`).
- Tema oscuro por defecto + selector de tema (Sistema / Claro / Oscuro).
- Ejecutable portable (EXE único) o instalador (NSIS) vía electron-builder.

## Requisitos

- Windows 10/11 con Docker Desktop instalado.
- Docker Compose v2 (`docker compose`).
- Una carpeta de proyecto n8n con el archivo `docker-compose.yml` (configura la ruta en `main.js`).

## Desarrollo

```bash
# En la carpeta launcher del proyecto
npm install
npm run dev
```

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
├─ main.js                 # Lógica Electron (Docker start/stop, ventana, tema)
├─ package.json            # Configuración y scripts de build
├─ renderer/
│  └─ index.html           # Pantalla de carga
└─ scripts/
   └─ build-icon.js        # Convierte PNG -> ICO (256x256)
```

## Notas

- El icono se genera desde `../n8n/N8n--Streamline-Simple-Icons.png` (o tu imagen PNG de 256x256) y se guarda en `launcher/build/icon.ico`.
- **Configuración requerida:** Edita las constantes en `main.js`:
  - `N8N_CWD`: Ruta absoluta a tu carpeta con `docker-compose.yml`
  - `DOCKER_DESKTOP`: Ruta a Docker Desktop.exe (por defecto: `C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe`)
- La app detiene el contenedor al cerrar; cámbialo a `down` en el código si quieres que se elimine.
