'use strict';

const {
  BrowserWindow,
  Menu,
  app,
  dialog,
  ipcMain,
  protocol,
  session,
} = require('electron');
const { createProtocol } = require('vue-cli-plugin-electron-builder/lib');
const { join } = require('path');
const { homedir } = require('os');
const { existsSync, mkdirSync, readdirSync } = require('fs');
const log4js = require('log4js');
const createEra = require('@/era/era-electron');
const { engineCommand } = require('@/renderer/utils/embedded');

const isDevelopment = process.env.NODE_ENV !== 'production';

const configStore = new (require('electron-store'))();

const logPath = join(app.getPath('userData'), './logs');
if (!existsSync(logPath)) {
  mkdirSync(logPath);
}
log4js.configure({
  appenders: {
    console: { type: 'console' },
    file: {
      filename: join(logPath, './main.log'),
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
const engineLogger = log4js.getLogger('engine');
if (isDevelopment) {
  logger.level = 'debug';
  engineLogger.level = 'debug';
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    backgroundColor: 'black',
    height: 880,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: join(__dirname, 'preload.js'),
    },
    width: 1000,
  });

  function setContentHeight() {
    win.webContents.send('engine', {
      action: engineCommand.resize,
      arg: win.getContentSize()[1],
    });
  }

  win.on('resize', setContentHeight);

  const era = createEra(
    configStore.get('last') || join(process.cwd(), './game'),
    (action, data) => {
      win.webContents.send('connector', { action, data });
    },
    (key, cb) => {
      ipcMain.on(key, cb);
    },
    (key) => {
      ipcMain.removeAllListeners(key);
    },
    () => {
      win.setSize(
        era.config.window.width || 880,
        era.config.window.height || 1000,
      );
      setContentHeight();
      if (era.config.window.autoMax) {
        win.maximize();
      }
    },
    (_path) => {
      configStore.set('last', _path);
    },
    engineLogger,
    isDevelopment,
  );

  ipcMain.removeAllListeners();

  ipcMain.on('engine', (_, action) => {
    switch (action) {
      case engineCommand.restart:
        era.restart();
        break;
      case engineCommand.start:
        era.start();
        win.webContents.send('engine', {
          action: engineCommand.version,
          arg: app.getVersion(),
        });
        break;
      default:
    }
  });

  ipcMain.on('era', (_, msg) => {
    switch (msg.action) {
      case 'add':
        win.webContents.send('connector', {
          action: 'log',
          data: { info: era.api.add(msg.key, msg.val) },
        });
        break;
      case 'get':
        win.webContents.send('connector', {
          action: 'log',
          data: { info: era.api.get(msg.key) },
        });
        break;
      case 'logData':
        win.webContents.send('connector', {
          action: 'log',
          data: { info: era.data },
        });
        break;
      case 'logStatic':
        win.webContents.send('connector', {
          action: 'log',
          data: { info: era.staticData },
        });
        break;
      case 'set':
        win.webContents.send('connector', {
          action: 'log',
          data: { info: era.api.set(msg.key, msg.val) },
        });
        break;
    }
  });

  const template = [];
  if (process.platform === 'darwin') {
    template.push({
      role: 'appMenu',
    });
  }
  template.push(
    {
      label: '游戏',
      submenu: [
        {
          accelerator: 'CmdOrCtrl+T',
          click() {
            win.webContents.send('engine', { action: engineCommand.restart });
          },
          label: '返回标题',
        },
        {
          label: '重新载入',
          role: 'reload',
        },
        {
          click() {
            const paths = dialog.showOpenDialogSync({
              properties: ['openDirectory'],
            });
            if (paths && paths.length) {
              era.setPath(paths[0]);
              era.start();
            }
          },
          label: '选择游戏文件夹',
        },
        {
          label: '退出',
          role: 'quit',
        },
      ],
    },
    {
      label: '调试',
      submenu: [
        {
          label: '控制台',
          role: 'toggleDevTools',
        },
        { type: 'separator' },
        { label: '撤销', role: 'undo' },
        { label: '重做', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', role: 'cut' },
        { label: '复制', role: 'copy' },
        { label: '粘贴', role: 'paste' },
        { label: '删除', role: 'delete' },
        { type: 'separator' },
        { label: '全选', role: 'selectAll' },
      ],
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '版权信息',
          click() {
            win.webContents.send('engine', { action: engineCommand.copyright });
          },
        },
      ],
    },
  );
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
