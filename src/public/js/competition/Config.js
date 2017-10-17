const { remote } = require('electron');
const fs = require('fs');
const semver = require('semver');

const { store, competition, version } = remote.getCurrentWindow();

let cachedConfig = null;

class Config {
  static getConfig(fromCache = false) {
    if (fromCache && cachedConfig !== null) {
      return JSON.parse(JSON.stringify(cachedConfig));
    }

    cachedConfig = store.get('config');
    return Config.getConfig(true);
  }

  static getWrapperCommands() {
    const config = Config.getConfig();

    config.wrapper.resultFile = './resultfile.json';
    config.wrapper.debug = true;
    config.match.engine = config.match.engine || {};
    config.match.engine.command = 'java -jar path/to/engine.jar';

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
    && (data.match.bots[0].name === undefined || typeof data.match.bots[0].name === 'string')
    && typeof data.match.bots[0].command === 'string'
    && (data.match.bots[1].name === undefined || typeof data.match.bots[1].name === 'string')
    && typeof data.match.bots[1].command === 'string';
  }

  static import(data) {
    const config = store.get('config') || {};

    config.wrapper = config.wrapper || {};
    config.wrapper.timebankMax = data.wrapper.timebankMax;
    config.wrapper.timePerMove = data.wrapper.timePerMove;
    config.wrapper.maxTimeouts = data.wrapper.maxTimeouts;

    config.match = config.match || {};
    config.match.bots = config.match.bots || [{}, {}];
    config.match.bots[0].name = data.match.bots[0].name !== undefined ? data.match.bots[0].name : config.match.bots[0].name;
    config.match.bots[0].command = data.match.bots[0].command;
    config.match.bots[1].name = data.match.bots[1].name !== undefined ? data.match.bots[1].name : config.match.bots[1].name;
    config.match.bots[1].command = data.match.bots[1].command;

    config.match.engine = {};

    store.set('config', config);

    if (data.match.engine && data.match.engine.configuration && Object.keys(data.match.engine.configuration).length > 0) {
      const configuration = {};

      Object.keys(data.match.engine.configuration).forEach((key) => {
        configuration[key] = data.match.engine.configuration[key];
      });

      store.set('config.match.engine.configuration', configuration);
    }

    store.set('versionOfLastUpdate', version);
  }

  static reset() {
    store.delete('config');

    const defaults = fs.readFileSync(competition.paths.defaultWrapperCommands).toString();
    Config.import(JSON.parse(defaults));
  }

  static shouldReset() {
    const lastVersion = store.get('versionOfLastUpdate');
    return lastVersion === undefined || semver.lt(lastVersion, '2.0.0');
  }
}

module.exports = Config;
