const HackMan = require('./hack-man/HackMan');
const LightRiders = require('./light-riders/LightRiders');
const UltimateTicTacToe = require('./ultimate-tic-tac-toe/UltimateTicTacToe');
const AIBlockBattle = require('./ai-block-battle/AIBlockBattle');
const Go = require('./go/Go');
const FourInARow = require('./four-in-a-row/FourInARow');
const MsHackMan = require('./ms-hack-man/MsHackMan');
const TexasHoldem = require('./texas-holdem/TexasHoldem');
const GameOfLifeAndDeath = require('./game-of-life-and-death/GameOfLifeAndDeath');
const CryptoTrader = require('./crypto-trader/CryptoTrader');

module.exports = [
  new HackMan(),
  new LightRiders(),
  new UltimateTicTacToe(),
  new AIBlockBattle(),
  new Go(),
  new FourInARow(),
  new MsHackMan(),
  new TexasHoldem(),
  new GameOfLifeAndDeath(),
  new CryptoTrader(),
].sort((c1, c2) => c1.name.localeCompare(c2.name));
