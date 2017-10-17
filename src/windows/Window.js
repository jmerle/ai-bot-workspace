const { Menu } = require('electron');
const path = require('path');

class Window {
  constructor() {
    this.window = null;
    this.iconPath = path.resolve(__dirname, '../img/icon.png');
  }

  open() {
    return;
  }

  close() {
    if (this.window !== null) {
      this.window.close();
    }
  }

  isCreated() {
    return this.window !== null;
  }

  isOpen() {
    return this.isCreated() && this.window.isVisible();
  }

  isClosed() {
    return this.window === null;
  }

  send(channel) {
    const args = [];

    for (let i = 1; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    if (this.isOpen()) {
      this.window.webContents.send(channel, ...args);
    } else {
      this.window.on('show', () => this.window.webContents.send(channel, ...args));
    }
  }

  setMenu(menu, setOnMacOS = true) {
    if (process.platform === 'darwin') {
      if (setOnMacOS) {
        Menu.setApplicationMenu(menu);
      }
    } else {
      this.window.setMenu(menu);
    }
  }

  attachEvents() {
    this.window.on('ready-to-show', () => this.window.show());
    this.window.on('closed', () => this.window = null);
  }
}

module.exports = Window;
