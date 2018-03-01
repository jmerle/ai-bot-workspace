const path = require('path');
const Competition = require('../Competition');
const ConfigurationItem = require('../ConfigurationItem');

class AIBlockBattle extends Competition {
  constructor() {
    super(false);

    this.id = 'ai-block-battle';
    this.name = 'AI Block Battle';
    this.description = 'Match the blocks, clear the lines and fill your opponent\'s field with garbage!';
    this.url = 'https://playground.riddles.io/competitions/ai-block-battle';
    this.playerCount = 2;

    this.paths.cssMain = path.resolve(__dirname, 'css/main.min.css');
    this.paths.cssOverride = path.resolve(__dirname, 'css/override.min.css');
    this.paths.js = path.resolve(__dirname, 'js/main.min.js');
    this.paths.engine = path.resolve(__dirname, 'engine/engine-1.0.1.jar').replace('app.asar', 'app.asar.unpacked');
    this.paths.defaultWrapperCommands = path.resolve(__dirname, 'default-wrapper-commands.json');

    this.matchViewerPercentage = 58.8;

    this.configurationItems.push(
      new ConfigurationItem('maxRounds', 'integer', 'Max amount of rounds'),
    );
  }
}

module.exports = AIBlockBattle;
