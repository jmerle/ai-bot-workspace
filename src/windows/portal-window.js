const { BrowserWindow } = require('electron');
const path = require('path');
const Store = require('electron-store');
const semver = require('semver');
const Window = require('./Window');
const competitions = require('../competitions/competitions');
const changelogWindow = require('./changelog-window');

class PortalWindow extends Window {
  open() {
    if (this.window !== null) {
      this.window.focus();
      return;
    }

    this.window = new BrowserWindow({
      width: 943,
      height: 650,
      useContentSize: true,
      icon: this.iconPath,
      resizable: false,
      show: false,
    });

    this.window.competitions = competitions;

    const packageData = require('../../package.json');
    this.window.version = packageData.version;

    const config = new Store();
    const lastVersion = config.get('lastVersion', '1.0.0');

    if (semver.gt(packageData.version, lastVersion)) {
      this.window.on('show', () => changelogWindow.open());
      config.set('lastVersion', packageData.version);
    }

    this.setMenu(null);
    this.window.loadURL('file:///' + path.resolve(__dirname, '../public/portal.html'));

    this.attachEvents();
  }
}

module.exports = new PortalWindow();
