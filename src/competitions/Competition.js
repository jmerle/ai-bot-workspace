const path = require('path');
const ConfigurationItem = require('./ConfigurationItem');

const matchWrapperPath = path.resolve(__dirname, '../match-wrapper/match-wrapper-1.4.1.jar').replace('app.asar', 'app.asar.unpacked');

class Competition {
  constructor(hasSeed) {
    this.id = null;
    this.name = null;
    this.description = null;

    this.paths = {
      matchWrapper: matchWrapperPath,
      cssMain: null,
      cssOverride: null,
      js: null,
      engine: null,
      defaultWrapperCommands: null,
    };

    this.matchViewerPercentage = null;

    this.configurationItems = [];
    this.hasSeed = hasSeed;

    if (hasSeed) {
      this.configurationItems.push(
        new ConfigurationItem('seed', 'string', 'Seed', 'leave empty to let the engine randomly generate one'),
      );
    }
  }
}

module.exports = Competition;
