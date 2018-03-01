const path = require('path');
const Competition = require('../Competition');
const ConfigurationItem = require('../ConfigurationItem');

class GameOfLifeAndDeath extends Competition {
  constructor() {
    super(true);

    this.id = 'game-of-life-and-death';
    this.name = 'Game of Life and Death';
    this.description = 'Manipulate life and death in order to grow your colony of cells and defeat your opponent!';
    this.url = 'https://starapple.riddles.io/competitions/game-of-life-and-death';
    this.playerCount = 2;

    this.paths.cssMain = path.resolve(__dirname, 'css/main.min.css');
    this.paths.cssOverride = path.resolve(__dirname, 'css/override.min.css');
    this.paths.js = path.resolve(__dirname, 'js/main.min.js');
    this.paths.engine = path.resolve(__dirname, 'engine/engine-1.1.0.jar').replace('app.asar', 'app.asar.unpacked');
    this.paths.defaultWrapperCommands = path.resolve(__dirname, 'default-wrapper-commands.json');

    this.matchViewerPercentage = 58.8;

    this.configurationItems.push(
      new ConfigurationItem('maxRounds', 'integer', 'Max amount of rounds'),
      new ConfigurationItem('initialCellsPerPlayer', 'integer', 'Initial cells per player'),
      new ConfigurationItem('separateStartingCells', 'integer', '1 for initially separated cells, 0 otherwise'),
    );
  }
}

module.exports = GameOfLifeAndDeath;
