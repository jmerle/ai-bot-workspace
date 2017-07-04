const { app, Menu, shell, BrowserWindow, ipcMain } = require('electron');
const Store = require('electron-store');

const config = require('./config.json');
const publicDirectory = `${__dirname}/public`;

let currentCompetition = null;

let portalWindow = null;
let competitionWindow = null;
let settingsWindow = null;

const openPortal = (closeCompetitionWindow = false) => {
  portalWindow = new BrowserWindow({
    width: 932,
    height: 600,
    icon: 'public/img/icon.png',
    resizable: false,
    show: false
  });

  if (closeCompetitionWindow) {
    if (competitionWindow !== null) competitionWindow.close();
    if (settingsWindow !== null) settingsWindow.close();
  }

  portalWindow.setMenu(null);
  portalWindow.config = config;

  portalWindow.loadURL(`file://${publicDirectory}/portal.html`);

  portalWindow.on('ready-to-show', () => {
    portalWindow.show();
  });

  portalWindow.on('closed', () => {
    portalWindow = null;
  });
};

const openSettings = competition => {
  if (settingsWindow !== null) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: competition.settingsWindow.width,
    height: competition.settingsWindow.height,
    parent: competitionWindow,
    icon: 'public/img/icon.png',
    modal: true,
    resizable: false,
    show: false
  });

  settingsWindow.directory = `${publicDirectory}/competitions/${competition.id}`;
  settingsWindow.store = new Store({name: currentCompetition.id});

  settingsWindow.setMenu(null);
  settingsWindow.loadURL(`file://${publicDirectory}/competitions/${competition.id}/settings.html`);

  settingsWindow.on('ready-to-show', () => {
    settingsWindow.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
};

const getCompetitionMenu = competition => {
  const settingsMenu = {
    label: 'Settings',
    accelerator: 'CmdOrCtrl+,',
    click: () => {
      openSettings(competition);
    }
  };

  const openPortalMenu = {
    label: 'Back to Portal',
    click: () => {
      ipcMain.once('ready-to-close', () => {
        openPortal(true);
      });

      competitionWindow.webContents.send('close');
    }
  };

  const template = [
    {
      label: 'File',
      submenu: [
        settingsMenu,
        openPortalMenu,
        {type: 'separator'},
        {role: 'quit'}
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'pasteandmatchstyle'},
        {role: 'delete'},
        {role: 'selectall'}
      ]
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    {
      role: 'window',
      submenu: [
        {role: 'minimize'},
        {role: 'close'}
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Competition page',
          click: () => {
            shell.openExternal(competition.competitionUrl);
          }
        }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template[0] = {
      label: app.getName(),
      submenu: [
        {role: 'about'},
        {type: 'separator'},
        {role: 'services', submenu: [settingsMenu, openPortalMenu]},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    };

    template[3].submenu = [
      {role: 'close'},
      {role: 'minimize'},
      {role: 'zoom'},
      {type: 'separator'},
      {role: 'front'}
    ];
  }

  return Menu.buildFromTemplate(template);
};

const openCompetition = competition => {
  currentCompetition = competition;

  competitionWindow = new BrowserWindow({
    width: competition.competitionWindow.width,
    height: competition.competitionWindow.height,
    icon: 'public/img/icon.png',
    show: false
  });

  portalWindow.close();

  competitionWindow.competition = competition;
  competitionWindow.directory = `${publicDirectory}/competitions/${competition.id}`;
  competitionWindow.store = new Store({name: competition.id});

  competitionWindow.setMenu(getCompetitionMenu(competition));
  competitionWindow.loadURL(`file://${publicDirectory}/competitions/${competition.id}/index.html`);

  competitionWindow.on('ready-to-show', () => {
    competitionWindow.show();
  });

  competitionWindow.on('closed', () => {
    competitionWindow = null;
    currentCompetition = null;
  });
};

ipcMain.on('open-competition', (event, competition) => {
  openCompetition(competition);
});

ipcMain.on('settings-updated', (event, args) => {
  settingsWindow.close();
  competitionWindow.webContents.send('update-settings');
});

app.on('ready', () => { openPortal(); });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (portalWindow === null && competitionWindow === null && settingsWindow === null) {
    openPortal();
  }
});
