const { app, BrowserWindow } = require('electron');
const path = require('path');
const Store = require('electron-store');
const Window = require('./Window');
const competitionWindow = require('./competition-window');

class SettingsWindow extends Window {
  open(competition) {
    if (this.window !== null) {
      this.window.focus();
      return;
    }

    this.window = new BrowserWindow({
      width: 800,
      height: 600,
      useContentSize: true,
      icon: this.iconPath,
      parent: competitionWindow.window,
      modal: true,
      resizable: false,
      show: false,
    });

    this.window.competition = competition;
    this.window.store = new Store({ name: competition.id });
    this.window.version = require('../../package.json').version;
    this.window.importExportDirectory = app.getPath('documents');

    this.setMenu(null, false);
    this.window.loadURL('file:///' + path.resolve(__dirname, '../public/settings.html'));

    this.attachEvents();
  }
}

module.exports = new SettingsWindow();
