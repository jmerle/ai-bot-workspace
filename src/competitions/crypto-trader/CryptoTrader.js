const path = require('path');
const Competition = require('../Competition');
const ConfigurationItem = require('../ConfigurationItem');

class CryptoTrader extends Competition {
  constructor() {
    super(false);

    this.id = 'crypto-trader';
    this.name = 'Crypto Trader';
    this.description = 'Create a crypto-trading bot and maximize profits by using the best trading strategies!';
    this.url = 'https://playground.riddles.io/competitions/crypto-trader';
    this.playerCount = 1;

    this.paths.cssMain = path.resolve(__dirname, 'css/main.min.css');
    this.paths.cssOverride = path.resolve(__dirname, 'css/override.min.css');
    this.paths.js = path.resolve(__dirname, 'js/main.min.js');
    this.paths.engine = path.resolve(__dirname, 'engine/engine-1.1.0.jar').replace('app.asar', 'app.asar.unpacked');
    this.paths.defaultWrapperCommands = path.resolve(__dirname, 'default-wrapper-commands.json');

    this.matchViewerPercentage = 58.8;

    this.configurationItems.push(
      new ConfigurationItem('dataFile', 'string', 'Location of the .csv file with candle data.'),
      new ConfigurationItem('candleInterval', 'integer', 'The amount of time in seconds between each candle in the data file.'),
      new ConfigurationItem('initialStack', 'integer', 'The amount of USDT to start the game with.'),
      new ConfigurationItem('givenCandles', 'integer', 'Candles given before the game starts.'),
      new ConfigurationItem('transactionFeePercent', 'double', 'Percentage of fee per transaction.'),
    );
  }
}

module.exports = CryptoTrader;
