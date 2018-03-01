const path = require('path');
const Competition = require('../Competition');
const ConfigurationItem = require('../ConfigurationItem');

class HackMan extends Competition {
  constructor() {
    super(true);

    this.id = 'hack-man';
    this.name = 'Hack Man';
    this.description = 'Navigate HQ, search for code, smash the bugs and beat your opponent!';
    this.url = 'https://booking.riddles.io/competitions/hack-man';
    this.playerCount = 2;

    this.paths.cssMain = path.resolve(__dirname, 'css/main.min.css');
    this.paths.cssOverride = path.resolve(__dirname, 'css/override.min.css');
    this.paths.js = path.resolve(__dirname, 'js/main.min.js');
    this.paths.engine = path.resolve(__dirname, 'engine/engine-2.0.3.jar').replace('app.asar', 'app.asar.unpacked');
    this.paths.defaultWrapperCommands = path.resolve(__dirname, 'default-wrapper-commands.json');

    this.matchViewerPercentage = 84.286;

    this.configurationItems.push(
      new ConfigurationItem('maxRounds', 'integer', 'Max amount of rounds'),
    );
  }
}

module.exports = HackMan;
