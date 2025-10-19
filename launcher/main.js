const { app, BrowserWindow, dialog, nativeTheme, Menu, ipcMain } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const waitOn = require('wait-on');
const crypto = require('crypto');

// Paths and constants
const N8N_CWD = path.resolve(__dirname, '..');
const DOCKER_DESKTOP = "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe";
const CONFIG_PATH = path.join(__dirname, 'config.json');

// Dynamic import for ESM-only execa
let _execaFn = null;
async function ex() {
  if (_execaFn) return _execaFn;
  const mod = await import('execa');
  _execaFn = mod.execa;
  return _execaFn;
}

// ============================================================================
// CONFIG MANAGEMENT
// ============================================================================

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
  
  return {
    version: '1.0',
    autoConnect: true,
    lastUsed: null,
    connections: []
  };
}

function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving config:', error);
  }
}

function generateId() {
  return 'conn_' + crypto.randomBytes(8).toString('hex');
}

// ============================================================================
// DOCKER FUNCTIONS
// ============================================================================

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
    console.error('Failed to start Docker Desktop:', e);
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

async function listN8nContainers() {
  try {
    const execaFn = await ex();
    
    // List all containers with n8n image
    const { stdout } = await execaFn('docker', [
      'ps', '-a',
      '--filter', 'ancestor=n8nio/n8n',
      '--format', '{{.ID}}|{{.Names}}|{{.Status}}|{{.Ports}}'
    ]);
    
    if (!stdout.trim()) {
      return [];
    }
    
    const containers = [];
    const lines = stdout.trim().split('\n');
    
    for (const line of lines) {
      const [id, name, status, ports] = line.split('|');
      
      // Extract port from ports string (e.g., "0.0.0.0:5678->5678/tcp")
      let port = '5678';
      const portMatch = ports.match(/0\.0\.0\.0:(\d+)->5678/);
      if (portMatch) {
        port = portMatch[1];
      }
      
      const isRunning = status.toLowerCase().includes('up');
      
      containers.push({
        id,
        name,
        status: isRunning ? 'running' : 'stopped',
        url: `http://localhost:${port}`,
        port,
        type: 'docker'
      });
    }
    
    return containers;
  } catch (error) {
    console.error('Error listing containers:', error);
    return [];
  }
}

async function startContainer(containerId) {
  try {
    const execaFn = await ex();
    await execaFn('docker', ['start', containerId]);
    return true;
  } catch (error) {
    throw new Error(`No se pudo iniciar el contenedor: ${error.message}`);
  }
}

async function stopContainer(containerId) {
  try {
    const execaFn = await ex();
    await execaFn('docker', ['stop', containerId], { timeout: 30000 });
    return true;
  } catch (error) {
    throw new Error(`No se pudo detener el contenedor: ${error.message}`);
  }
}

async function restartContainer(containerId) {
  try {
    const execaFn = await ex();
    await execaFn('docker', ['restart', containerId], { timeout: 30000 });
    return true;
  } catch (error) {
    throw new Error(`No se pudo reiniciar el contenedor: ${error.message}`);
  }
}

async function composeUp() {
  try {
    const execaFn = await ex();
    await execaFn('docker', ['compose', 'up', '-d'], { cwd: N8N_CWD });
    return true;
  } catch (error) {
    throw new Error(`Error al iniciar docker-compose: ${error.message}`);
  }
}

async function composeStop() {
  try {
    const execaFn = await ex();
    await execaFn('docker', ['compose', 'stop'], { cwd: N8N_CWD });
  } catch (error) {
    console.error('Error stopping compose:', error);
  }
}

// ============================================================================
// CONNECTION VALIDATION
// ============================================================================

async function validateN8nURL(url) {
  try {
    await waitOn({
      resources: [url],
      timeout: 10000,
      interval: 1000,
      tcpTimeout: 2000,
      httpTimeout: 2000,
      window: 0,
    });
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// ELECTRON WINDOWS
// ============================================================================

let mainWin;
let selectorWin;
let currentConnection = null;

function createMainWindow() {
  mainWin = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    icon: path.resolve(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  
  mainWin.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  
  mainWin.once('ready-to-show', () => {
    mainWin.show();
  });
}

function createSelectorWindow() {
  selectorWin = new BrowserWindow({
    width: 750,
    height: 700,
    resizable: false,
    show: true,
    icon: path.resolve(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });
  
  selectorWin.loadFile(path.join(__dirname, 'renderer', 'connection-selector.html'));
  selectorWin.setMenu(null);
  
  selectorWin.on('closed', () => {
    selectorWin = null;
    // If selector is closed without connection, quit app
    if (!currentConnection) {
      app.quit();
    }
  });
}

function setTheme(mode) {
  nativeTheme.themeSource = mode;
  if (mainWin) {
    const url = mainWin.webContents.getURL();
    if (url && url.startsWith('http')) {
      mainWin.loadURL(url);
    }
  }
}

function buildMenu() {
  const template = [
    {
      label: 'Conexión',
      submenu: [
        {
          label: 'Cambiar servidor n8n...',
          click: () => {
            if (!selectorWin) {
              createSelectorWindow();
            } else {
              selectorWin.focus();
            }
          }
        },
        {
          label: 'Reiniciar contenedor actual',
          enabled: currentConnection?.type === 'docker',
          click: async () => {
            if (currentConnection?.type === 'docker') {
              try {
                await restartContainer(currentConnection.containerId);
                dialog.showMessageBox(mainWin, {
                  type: 'info',
                  title: 'Contenedor reiniciado',
                  message: 'El contenedor se ha reiniciado correctamente'
                });
              } catch (error) {
                dialog.showErrorBox('Error', error.message);
              }
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Crear contenedor con docker-compose',
          click: async () => {
            try {
              if (!(await isDockerReady())) {
                throw new Error('Docker Desktop no está ejecutándose');
              }
              await composeUp();
              dialog.showMessageBox(mainWin, {
                type: 'info',
                title: 'Contenedor creado',
                message: 'El contenedor se ha creado correctamente. Selecciónalo desde "Cambiar servidor n8n"'
              });
            } catch (error) {
              dialog.showErrorBox('Error', error.message);
            }
          }
        }
      ]
    },
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

// ============================================================================
// IPC HANDLERS
// ============================================================================

ipcMain.handle('list-docker-containers', async () => {
  if (!(await isDockerReady())) {
    throw new Error('Docker Desktop no está ejecutándose');
  }
  return await listN8nContainers();
});

ipcMain.handle('list-remote-connections', async () => {
  const config = loadConfig();
  return config.connections.filter(c => c.type === 'remote');
});

ipcMain.handle('get-config', async () => {
  return loadConfig();
});

ipcMain.handle('add-remote-connection', async (event, { name, url }) => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('La URL debe comenzar con http:// o https://');
  }
  
  const config = loadConfig();
  const connection = {
    id: generateId(),
    name,
    type: 'remote',
    url: url.replace(/\/$/, ''), // Remove trailing slash
    lastConnected: null,
    isFavorite: false
  };
  
  config.connections.push(connection);
  saveConfig(config);
  
  return connection;
});

ipcMain.handle('delete-connection', async (event, id) => {
  const config = loadConfig();
  config.connections = config.connections.filter(c => c.id !== id);
  if (config.lastUsed === id) {
    config.lastUsed = null;
  }
  saveConfig(config);
});

ipcMain.handle('start-container', async (event, containerId) => {
  return await startContainer(containerId);
});

ipcMain.handle('restart-container', async (event, containerId) => {
  return await restartContainer(containerId);
});

ipcMain.handle('connect-to-server', async (event, { id, type, autoConnect }) => {
  const config = loadConfig();
  
  if (type === 'docker') {
    // Find container
    const containers = await listN8nContainers();
    const container = containers.find(c => c.id === id);
    
    if (!container) {
      throw new Error('Contenedor no encontrado');
    }
    
    // Start if stopped
    if (container.status === 'stopped') {
      await startContainer(container.id);
      // Wait a bit for container to start
      await new Promise(r => setTimeout(r, 3000));
    }
    
    // Validate URL is accessible
    const isValid = await validateN8nURL(container.url);
    if (!isValid) {
      throw new Error('El contenedor no responde. Espera unos segundos e intenta de nuevo.');
    }
    
    // Save or update connection
    let connection = config.connections.find(c => c.containerId === container.id);
    if (!connection) {
      connection = {
        id: generateId(),
        name: container.name,
        type: 'docker',
        containerId: container.id,
        containerName: container.name,
        url: container.url,
        lastConnected: new Date().toISOString(),
        isFavorite: false
      };
      config.connections.push(connection);
    } else {
      connection.lastConnected = new Date().toISOString();
      connection.url = container.url; // Update URL in case port changed
    }
    
    config.lastUsed = connection.id;
    config.autoConnect = autoConnect;
    saveConfig(config);
    
    currentConnection = connection;
    
    // Load n8n in main window
    await mainWin.loadURL(container.url);
    
  } else if (type === 'remote') {
    const connection = config.connections.find(c => c.id === id);
    
    if (!connection) {
      throw new Error('Conexión no encontrada');
    }
    
    // Validate URL is accessible
    const isValid = await validateN8nURL(connection.url);
    if (!isValid) {
      throw new Error('No se puede conectar a ' + connection.url);
    }
    
    connection.lastConnected = new Date().toISOString();
    config.lastUsed = connection.id;
    config.autoConnect = autoConnect;
    saveConfig(config);
    
    currentConnection = connection;
    
    // Load n8n in main window
    await mainWin.loadURL(connection.url);
  }
  
  // Rebuild menu to update "Reiniciar contenedor" state
  buildMenu();
});

// ============================================================================
// APP LIFECYCLE
// ============================================================================

function ensureDirs() {
  const dirs = [
    path.join(N8N_CWD, 'n8n-data'),
    path.join(N8N_CWD, 'postgres-data'),
  ];
  for (const d of dirs) {
    try { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); } catch {}
  }
}

app.whenReady().then(async () => {
  // Fix Windows taskbar icon grouping
  // This ensures the app and shortcuts are recognized as the same application
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.yourorg.n8nlauncher');
  }
  
  nativeTheme.themeSource = 'dark';
  createMainWindow();
  buildMenu();
  ensureDirs();
  
  const config = loadConfig();
  
  // Try auto-connect if enabled and has last connection
  if (config.autoConnect && config.lastUsed) {
    const lastConnection = config.connections.find(c => c.id === config.lastUsed);
    
    if (lastConnection) {
      try {
        if (lastConnection.type === 'docker') {
          // Check if Docker is ready
          if (!(await isDockerReady())) {
            startDockerDesktop();
            await waitForDockerReady();
          }
          
          // Find container
          const containers = await listN8nContainers();
          const container = containers.find(c => c.id === lastConnection.containerId);
          
          if (container) {
            // Start if needed
            if (container.status === 'stopped') {
              await startContainer(container.id);
              await new Promise(r => setTimeout(r, 3000));
            }
            
            // Validate and connect
            const isValid = await validateN8nURL(container.url);
            if (isValid) {
              currentConnection = lastConnection;
              await mainWin.loadURL(container.url);
              return;
            }
          }
        } else {
          // Remote connection
          const isValid = await validateN8nURL(lastConnection.url);
          if (isValid) {
            currentConnection = lastConnection;
            await mainWin.loadURL(lastConnection.url);
            return;
          }
        }
      } catch (error) {
        console.error('Auto-connect failed:', error);
      }
    }
  }
  
  // If auto-connect failed or disabled, show selector
  createSelectorWindow();
});

app.on('before-quit', async (e) => {
  // Stop docker containers if current connection is local
  if (currentConnection?.type === 'docker') {
    try {
      await stopContainer(currentConnection.containerId);
    } catch (error) {
      console.error('Error stopping container:', error);
    }
  }
});

app.on('window-all-closed', () => {
  app.quit();
});
