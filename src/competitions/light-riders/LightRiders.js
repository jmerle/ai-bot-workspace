const path = require('path');
const Competition = require('../Competition');
const ConfigurationItem = require('../ConfigurationItem');

class LightRiders extends Competition {
  constructor() {
    super(true);

    this.id = 'light-riders';
    this.name = 'Light Riders';
    this.description = 'An epic race game that requires smart thinking, rather than speed!';
    this.url = 'https://playground.riddles.io/competitions/light-riders';
    this.playerCount = 2;

    this.paths.cssMain = path.resolve(__dirname, 'css/main.min.css');
    this.paths.cssOverride = path.resolve(__dirname, 'css/override.min.css');
    this.paths.js = path.resolve(__dirname, 'js/main.min.js');
    this.paths.engine = path.resolve(__dirname, 'engine/engine-1.1.0.jar').replace('app.asar', 'app.asar.unpacked');
    this.paths.defaultWrapperCommands = path.resolve(__dirname, 'default-wrapper-commands.json');

    this.matchViewerPercentage = 58.8;

    this.configurationItems.push(
      new ConfigurationItem('maxRounds', 'integer', 'Max amount of rounds'),
    );
  }
}

module.exports = LightRiders;
