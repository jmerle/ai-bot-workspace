const fs = require('fs');
const path = require('path');

const store = require('electron').remote.getCurrentWindow().store;
const directory = require('electron').remote.getCurrentWindow().directory;

class Config {
  static getConfig() {
    return JSON.parse(JSON.stringify(store.get('config')));
  }

  static getWrapperCommands() {
    const config = Config.getConfig();

    config.wrapper.resultFile = './resultfile.json';
    config.wrapper.debug = true;
    config.match.engine = {
      command: 'java -jar path/to/engine.jar'
    };

    delete config.match.bots[0].name;
    delete config.match.bots[1].name;

    return config;
  }

  static isValidWrapperCommands(data) {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return false;
    }

    return typeof data.wrapper === 'object'
    && Number.isInteger(data.wrapper.timebankMax)
    && Number.isInteger(data.wrapper.timePerMove)
    && Number.isInteger(data.wrapper.maxTimeouts)
    && typeof data.match === 'object'
    && Array.isArray(data.match.bots)
    && data.match.bots.length === 2
    && typeof data.match.bots[0].command === 'string'
    && typeof data.match.bots[1].command === 'string';
  }

  static import(data) {
    store.set('config', data);
  }

  static storeDefaults() {
    const defaults = fs.readFileSync(path.join(directory, 'default-wrapper-commands.json')).toString();
    Config.import(JSON.parse(defaults));
  }

  static isFirstRun() {
    return !store.has('config');
  }
}

module.exports = Config;
