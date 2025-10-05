const { app, BrowserWindow, dialog, nativeTheme, Menu } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const waitOn = require('wait-on');

// Paths and constants - CONFIGURE THESE FOR YOUR SYSTEM
const N8N_CWD = "C:\\path\\to\\your\\n8n\\folder"; // Folder containing docker-compose.yml
const N8N_URL = "http://localhost:5678";
const DOCKER_DESKTOP = "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe";

// Dynamic import for ESM-only execa
let _execaFn = null;
async function ex() {
  if (_execaFn) return _execaFn;
  const mod = await import('execa');
  _execaFn = mod.execa;
  return _execaFn;
}

// Ensure data directories exist so bind mounts stay on G:
function ensureDirs() {
  const dirs = [
    path.join(N8N_CWD, 'n8n-data'),
    path.join(N8N_CWD, 'postgres-data'),
  ];
  for (const d of dirs) {
    try { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); } catch {}
  }
}

async function isDockerReady() {
  try {
    await (await ex())('docker', ['info'], { timeout: 8000 });
    return true;
  } catch {
    return false;
  }
}

function startDockerDesktop() {
  try {
    spawn(DOCKER_DESKTOP, { detached: true, stdio: 'ignore' }).unref();
  } catch (e) {
    // If it fails, the app will keep waiting for docker anyway
  }
}

async function waitForDockerReady(timeoutMs = 180000) {
  const start = Date.now();
  while ((Date.now() - start) < timeoutMs) {
    if (await isDockerReady()) return;
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error('Docker no estuvo listo en el tiempo esperado');
}

async function composeUp() {
  // Prefer compose v2: `docker compose`
  try {
    await (await ex())('docker', ['compose', 'up', '-d'], { cwd: N8N_CWD });
  } catch (e) {
    // If container name already exists (from manual run), try to start it by name
    try {
      await (await ex())('docker', ['start', 'n8n_Server']);
    } catch (e2) {
      throw e; // rethrow original error if fallback fails
    }
  }
}

async function composeStop() {
  try {
    await (await ex())('docker', ['compose', 'stop'], { cwd: N8N_CWD });
  } catch {}
  // Fallback: ensure container is stopped by name
  try {
    await (await ex())('docker', ['stop', 'n8n_Server']);
  } catch {}
}

async function waitForN8n(timeoutMs = 120000) {
  await waitOn({
    resources: [N8N_URL],
    timeout: timeoutMs,
    interval: 2000,
    tcpTimeout: 2000,
    httpTimeout: 2000,
    window: 0,
  });
}

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    icon: path.resolve(__dirname, 'build', 'icon.ico'),
    webPreferences: { contextIsolation: true }
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

function setTheme(mode) {
  // mode: 'system' | 'light' | 'dark'
  nativeTheme.themeSource = mode;
  if (win) {
    // Reload current view to let prefers-color-scheme propagate
    const url = win.webContents.getURL();
    if (url && url.startsWith('http')) {
      win.loadURL(url);
    }
  }
}

function buildMenu() {
  const template = [
    {
      label: 'Ver',
      submenu: [
        { label: 'Tema del sistema', type: 'radio', checked: nativeTheme.themeSource === 'system', click: () => setTheme('system') },
        { label: 'Claro', type: 'radio', checked: nativeTheme.themeSource === 'light', click: () => setTheme('light') },
        { label: 'Oscuro', type: 'radio', checked: nativeTheme.themeSource === 'dark', click: () => setTheme('dark') },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(async () => {
  // Default to dark theme as requested
  nativeTheme.themeSource = 'dark';
  createWindow();
  buildMenu();
  ensureDirs();
  try {
    if (!(await isDockerReady())) {
      startDockerDesktop();
      await waitForDockerReady();
    }

    await composeUp();
    await waitForN8n();

    // Load embedded n8n
    await win.loadURL(N8N_URL);
  } catch (err) {
    dialog.showErrorBox('Error al iniciar n8n', String(err?.message || err));
  }
});

// On close, stop the container (user requested)
app.on('before-quit', async (e) => {
  // Try graceful stop; don't block quit too long
  try { await composeStop(); } catch {}
});

app.on('window-all-closed', () => {
  app.quit();
});
