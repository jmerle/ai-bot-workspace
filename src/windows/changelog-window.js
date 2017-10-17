const { BrowserWindow } = require('electron');
const path = require('path');
const Window = require('./Window');

class ChangelogWindow extends Window {
  open() {
    if (this.window !== null) {
      this.window.focus();
      return;
    }

    this.window = new BrowserWindow({
      width: 800,
      height: 600,
      useContentSize: true,
      icon: this.iconPath,
    });

    this.setMenu(null);
    this.window.loadURL('file:///' + path.resolve(__dirname, '../public/changelog.html'));

    this.attachEvents();
  }
};

module.exports = new ChangelogWindow();
