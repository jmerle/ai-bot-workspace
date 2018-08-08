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

    config.match.bots.forEach(bot => {
      delete bot.name;
    });

    return config;
  }

  static isValidWrapperCommands(data) {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return false;
    }

    const { wrapper, match } = data;

    return typeof wrapper === 'object'
    && Number.isInteger(wrapper.timebankMax)
    && Number.isInteger(wrapper.timePerMove)
    && Number.isInteger(wrapper.maxTimeouts)
    && typeof match === 'object'
    && Array.isArray(match.bots)
    && match.bots.length === competition.playerCount
    && match.bots.every(bot => (bot.name === undefined || typeof bot.name === 'string')
        && typeof bot.command === 'string');
  }

  static import(data) {
    const config = store.get('config') || {};

    const { wrapper, match } = data;

    config.wrapper = wrapper || {};
    config.wrapper.timebankMax = wrapper.timebankMax;
    config.wrapper.timePerMove = wrapper.timePerMove;
    config.wrapper.maxTimeouts = wrapper.maxTimeouts;

    config.match = match || {};
    config.match.bots = match.bots || [...Array(competition.playerCount)].map(() => ({}));
    config.match.bots.forEach((bot, i) => {
      bot.name = match.bots[i].name !== undefined ? match.bots[i].name : config.match.bots[i].name;
      bot.command = match.bots[i].command;
    });

    config.match.engine = {};

    store.set('config', config);

    if (match.engine && match.engine.configuration && Object.keys(match.engine.configuration).length > 0) {
      const configuration = {};

      Object.keys(match.engine.configuration).forEach((key) => {
        configuration[key] = match.engine.configuration[key];
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
