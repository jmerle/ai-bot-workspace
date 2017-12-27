const { app, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');

const competitions = require('./competitions/competitions');

const portalWindow = require('./windows/portal-window');
const aboutWindow = require('./windows/about-window');
const changelogWindow = require('./windows/changelog-window');
const competitionWindow = require('./windows/competition-window');
const settingsWindow = require('./windows/settings-window');

autoUpdater.autoDownload = false;
autoUpdater.logger = null;
let cancellationToken = null;
let isDownloading = false;

const checkForUpdates = () => {
  portalWindow.send('checking-for-updates');
  autoUpdater.checkForUpdates().then(result => cancellationToken = result.cancellationToken).catch(() => {});
};

ipcMain.on('open-about', () => aboutWindow.open());
ipcMain.on('open-changelog', () => changelogWindow.open());
ipcMain.on('open-competition', (e, id) => competitionWindow.open(competitions.find(c => c.id === id)));
ipcMain.on('open-settings', (e, competition) => settingsWindow.open(competition));

ipcMain.on('settings-updated', () => {
  competitionWindow.send('update-settings');
  settingsWindow.close();
});

ipcMain.on('update', () => {
  const promise = autoUpdater.downloadUpdate(cancellationToken);
  isDownloading = true;

  portalWindow.window.on('close', () => cancellationToken.cancel());
});

ipcMain.on('check-for-updates', () => checkForUpdates());

autoUpdater.on('update-available', info => portalWindow.send('new-version', info.version));
autoUpdater.on('update-not-available', () => portalWindow.send('no-new-version'));

autoUpdater.on('error', () => {
  if (!isDownloading) {
    portalWindow.send('no-new-version');
  }
});

autoUpdater.on('download-progress', info => portalWindow.send('download-progress', info));
autoUpdater.on('update-downloaded', () => autoUpdater.quitAndInstall());

app.on('ready', () => {
  portalWindow.open();
  checkForUpdates();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (portalWindow.isClosed() && competitionWindow.isClosed()) {
    portalWindow.open();
  }
});
