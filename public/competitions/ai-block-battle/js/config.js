const fs = require('fs');
const path = require('path');

const store = require('electron').remote.getCurrentWindow().store;
const directory = require('electron').remote.getCurrentWindow().directory;

class Config {
  static getConfig() {
    return JSON.parse(JSON.stringify(store.get('config')));
  }

  static save(config) {
    store.set('config', config);
  }

  static storeDefaults() {
    Config.save({
      bots: [
        {
          name: 'Me',
          command: 'node path/to/bot'
        },
        {
          name: 'Enemy',
          command: 'node path/to/bot'
        }
      ]
    });
  }

  static isFirstRun() {
    return !store.has('config');
  }
}

module.exports = Config;
