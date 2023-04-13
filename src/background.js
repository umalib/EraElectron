'use strict';

const {
  app,
  BrowserWindow,
  protocol,
  session,
  ipcMain,
  Menu,
} = require('electron');
const { createProtocol } = require('vue-cli-plugin-electron-builder/lib');
const { join } = require('path');
const { homedir } = require('os');
const { readdirSync } = require('fs');
const log4js = require('log4js');
const createEra = require('@/era/era-electron');

const isDevelopment = process.env.NODE_ENV !== 'production';

log4js.configure({
  appenders: {
    console: { type: 'console' },
    file: {
      filename: join(app.getPath('userData'), './logs/main.log'),
      keepFileExt: true,
      pattern: 'yyMMdd',
      type: 'dateFile',
    },
  },
  categories: {
    default: { appenders: ['console', 'file'], level: 'info' },
  },
});
const logger = log4js.getLogger('background');

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1000,
    height: 880,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: join(__dirname, 'preload.js'),
    },
  });

  function connect(request) {
    win.webContents.send('connector', request);
  }

  function listen(key, cb) {
    ipcMain.on(key, cb);
  }

  function cleanListener(key) {
    ipcMain.removeAllListeners(key);
  }

  const era = createEra(
    join(process.cwd(), './game'),
    connect,
    listen,
    cleanListener,
    logger,
  );

  ipcMain.removeAllListeners();

  ipcMain.on('engine', (_, action) => {
    switch (action) {
      case 'load':
        era.start();
        break;
      case 'restart':
        era.restart();
        break;
    }
  });

  const template = [];
  if (process.platform === 'darwin') {
    template.push({
      role: 'appMenu',
    });
  }
  template.push({
    label: '游戏',
    submenu: [
      {
        label: '返回标题',
        accelerator: 'CmdOrCtrl+T',
        click() {
          win.webContents.send('engine', 'restart');
        },
      },
      {
        label: '重新载入',
        accelerator: 'CmdOrCtrl+R',
        click() {
          win.webContents.send('engine', 'reload');
        },
      },
      {
        label: '退出',
        role: 'quit',
      },
    ],
  });
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    await win.loadURL('app://./index.html');
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) await createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      const vueDevToolsPath = join(
        homedir(),
        '/Library/Application Support/Microsoft Edge/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd',
      );
      await session.defaultSession.loadExtension(
        `${vueDevToolsPath}/${readdirSync(vueDevToolsPath)[0]}`,
      );
    } catch (e) {
      logger.error('Vue Devtools failed to install:', e.toString());
    }
  }
  await createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
