const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');
const Window = require('./Window');
const portalWindow = require('./portal-window');
const settingsWindow = require('./settings-window');

class CompetitionWindow extends Window {
  constructor() {
    super();

    this.sizes = {
      58.8: {
        width: 1264,
        height: 758,
      },
      84.286: {
        width: 1184,
        height: 894,
      },
    };
  }

  open(competition) {
    if (this.window !== null) {
      this.window.focus();
      return;
    }

    const size = this.sizes[competition.matchViewerPercentage] || this.sizes[58.8];

    this.window = new BrowserWindow({
      width: size.width,
      height: size.height,
      useContentSize: true,
      icon: this.iconPath,
      show: false,
    });

    portalWindow.close();

    this.window.competition = competition;
    this.window.store = new Store({ name: competition.id });
    this.window.version = require('../../package.json').version;
    this.window.resultFileDirectory = app.getPath('temp');
    this.window.matchViewerPath = path.resolve(app.getPath('temp'), 'match-viewer.html');

    this.setMenu(this.getMenu(competition));
    this.window.loadURL('file:///' + path.resolve(__dirname, '../public/competition.html'));

    this.attachEvents();

    this.window.on('show', () => this.window.maximize());
  }

  getMenu(competition) {
    const settingsItem = {
      label: 'Settings',
      accelerator: 'CmdOrCtrl+,',
      click: () => settingsWindow.open(competition),
    };

    const openPortalItem = {
      label: 'Back to the portal',
      click: () => {
        ipcMain.once('ready-to-close', () => {
          portalWindow.open();
          settingsWindow.close();
          this.close();
        });

        this.window.webContents.send('close');
      },
    };

    const openCompetitionPageItem = {
      label: 'Competition page',
      click: () => shell.openExternal(competition.url),
    };

    const template = [
      {
        label: 'File',
        submenu: [
          settingsItem,
          openPortalItem,
          { type: 'separator' },
          { role: 'quit' },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },

          { type: 'separator' },

          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'pasteandmatchstyle' },
          { role: 'delete' },
          { role: 'selectall' },
        ],
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forcereload' },
          { role: 'toggledevtools' },

          { type: 'separator' },

          { role: 'resetzoom' },
          { role: 'zoomin' },
          { role: 'zoomout' },

          { type: 'separator' },

          { role: 'togglefullscreen' },
        ],
      },
      {
        role: 'window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' },
        ]
      },
      {
        label: 'Help',
        submenu: [
          openCompetitionPageItem,
        ],
      },
    ];

    if (process.platform === 'darwin') {
      template[0] = {
        label: app.getName(),
        submenu: [
          { role: 'about' },

          { type: 'separator' },

          settingsItem,
          openPortalItem,

          { type: 'separator' },

          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },

          { type: 'separator' },

          { role: 'quit' },
        ],
      };

      template[3].submenu = [
        { role: 'close' },
        { role: 'minimize' },
        { role: 'zoom' },

        { type: 'separator' },

        { role: 'front' },
      ];
    }

    return Menu.buildFromTemplate(template);
  }
}

module.exports = new CompetitionWindow();
