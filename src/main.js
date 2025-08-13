const { app, BrowserWindow } = require('electron');
const path = require('path');

// Detectar si estamos en modo desarrollo
const isDev = !app.isPackaged;

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // En desarrollo, cargar desde el servidor de desarrollo de Vite
  if (isDev) {
    // Intentar diferentes puertos de Vite
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      mainWindow.loadURL('http://localhost:5174');
    });
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, cargar el archivo HTML compilado
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
