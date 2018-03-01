const path = require('path');
const Competition = require('../Competition');
const ConfigurationItem = require('../ConfigurationItem');

class TexasHoldem extends Competition {
  constructor() {
    super(true);

    this.id = 'texas-holdem';
    this.name = 'Texas Hold \'em';
    this.description = 'In this poker variant bots will go heads up against each other!';
    this.url = 'https://playground.riddles.io/competitions/texas-hold-%27em';
    this.playerCount = 2;

    this.paths.cssMain = path.resolve(__dirname, 'css/main.min.css');
    this.paths.cssOverride = path.resolve(__dirname, 'css/override.min.css');
    this.paths.js = path.resolve(__dirname, 'js/main.min.js');
    this.paths.engine = path.resolve(__dirname, 'engine/engine-1.0.2.jar').replace('app.asar', 'app.asar.unpacked');
    this.paths.defaultWrapperCommands = path.resolve(__dirname, 'default-wrapper-commands.json');

    this.matchViewerPercentage = 58.8;

    this.configurationItems.push(
      new ConfigurationItem('initialStack', 'integer', 'Initial stack'),
    );
  }
}

module.exports = TexasHoldem;
