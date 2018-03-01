const path = require('path');
const Competition = require('../Competition');
const ConfigurationItem = require('../ConfigurationItem');

class Go extends Competition {
  constructor() {
    super(false);

    this.id = 'go';
    this.name = 'Go';
    this.description = 'Conquer the largest area on the board in this ancient Chinese board game!';
    this.url = 'https://playground.riddles.io/competitions/go';
    this.playerCount = 2;

    this.paths.cssMain = path.resolve(__dirname, 'css/main.min.css');
    this.paths.cssOverride = path.resolve(__dirname, 'css/override.min.css');
    this.paths.js = path.resolve(__dirname, 'js/main.min.js');
    this.paths.engine = path.resolve(__dirname, 'engine/engine-1.0.2.jar').replace('app.asar', 'app.asar.unpacked');
    this.paths.defaultWrapperCommands = path.resolve(__dirname, 'default-wrapper-commands.json');

    this.matchViewerPercentage = 58.8;

    this.configurationItems.push(
      new ConfigurationItem('maxRounds', 'integer', 'Max amount of rounds'),
    );
  }
}

module.exports = Go;
