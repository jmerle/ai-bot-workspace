const path = require('path');
const Competition = require('../Competition');

class FourInARow extends Competition {
  constructor() {
    super(false);

    this.id = 'four-in-a-row';
    this.name = 'Four In A Row';
    this.description = 'Create a row of four chips before your opponent does, in this simple yet exciting game!';
    this.url = 'https://playground.riddles.io/competitions/ai-block-battle';
    this.playerCount = 2;

    this.paths.cssMain = path.resolve(__dirname, 'css/main.min.css');
    this.paths.cssOverride = path.resolve(__dirname, 'css/override.min.css');
    this.paths.js = path.resolve(__dirname, 'js/main.min.js');
    this.paths.engine = path.resolve(__dirname, 'engine/engine-1.0.1.jar').replace('app.asar', 'app.asar.unpacked');
    this.paths.defaultWrapperCommands = path.resolve(__dirname, 'default-wrapper-commands.json');

    this.matchViewerPercentage = 58.8;
  }
}

module.exports = FourInARow;
