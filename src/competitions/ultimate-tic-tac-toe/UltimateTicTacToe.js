const path = require('path');
const Competition = require('../Competition');

class UltimateTicTacToe extends Competition {
  constructor() {
    super(false);

    this.id = 'ultimate-tic-tac-toe';
    this.name = 'Ultimate Tic Tac Toe';
    this.description = 'Tic Tac Toe like you\'ve never seen before. It\'s a classic with a twist!';
    this.url = 'https://playground.riddles.io/competitions/ultimate-tic-tac-toe';
    this.playerCount = 2;

    this.paths.cssMain = path.resolve(__dirname, 'css/main.min.css');
    this.paths.cssOverride = path.resolve(__dirname, 'css/override.min.css');
    this.paths.js = path.resolve(__dirname, 'js/main.min.js');
    this.paths.engine = path.resolve(__dirname, 'engine/engine-1.0.7.jar').replace('app.asar', 'app.asar.unpacked');
    this.paths.defaultWrapperCommands = path.resolve(__dirname, 'default-wrapper-commands.json');

    this.matchViewerPercentage = 58.8;
  }
}

module.exports = UltimateTicTacToe;
