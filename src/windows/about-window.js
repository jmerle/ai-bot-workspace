const { BrowserWindow } = require('electron');
const path = require('path');
const Window = require('./Window');
const competitions = require('../competitions/competitions');

class AboutWindow extends Window {
  open() {
    if (this.window !== null) {
      this.window.focus();
      return;
    }

    this.window = new BrowserWindow({
      width: 800,
      height: 800,
      useContentSize: true,
      icon: this.iconPath,
      resizable: false,
      show: false,
    });

    this.window.competitions = competitions;
    this.window.packageData = require('../../package.json');

    this.setMenu(null);
    this.window.loadURL('file:///' + path.resolve(__dirname, '../public/about.html'));

    this.attachEvents();
  }
}

module.exports = new AboutWindow();
