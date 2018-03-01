const path = require('path');
const Competition = require('../Competition');
const ConfigurationItem = require('../ConfigurationItem');

class MsHackMan extends Competition {
  constructor() {
    super(true);

    this.id = 'ms-hack-man';
    this.name = 'Ms. Hack-Man';
    this.description = 'Prepare yourself for the second Hack-man game. More intense and \'explosive\' than ever!';
    this.url = 'https://booking.riddles.io/competitions/ms.-hack-man';
    this.playerCount = 2;

    this.paths.cssMain = path.resolve(__dirname, 'css/main.min.css');
    this.paths.cssOverride = path.resolve(__dirname, 'css/override.min.css');
    this.paths.js = path.resolve(__dirname, 'js/main.min.js');
    this.paths.engine = path.resolve(__dirname, 'engine/engine-1.0.5.jar').replace('app.asar', 'app.asar.unpacked');
    this.paths.defaultWrapperCommands = path.resolve(__dirname, 'default-wrapper-commands.json');

    this.matchViewerPercentage = 84.286;

    this.configurationItems.push(
      new ConfigurationItem('maxRounds', 'integer', 'Max amount of rounds'),
    );
  }
}

module.exports = MsHackMan;
