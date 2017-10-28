class ConfigurationItem {
  /**
   * @param {String} key The key of this item in the engine's source code (examples: maxRounds, playerSnippetCount, bombMinTicks)
   * @param {String} type The type of this item, can be integer, string or double
   * @param {String} name The name as how it shows in the competition's settings window (examples: Max amount of rounds, Player snippet count, Bomb min ticks)
   * @param {String} info The extra bit of information shown between parentheses (will show as "<name> (<info>)")
   */
  constructor(key, type, name, info = 'leave empty to use the competition\'s default value') {
    this.key = key;
    this.type = type;
    this.name = name;
    this.info = info;
  }
}

module.exports = ConfigurationItem;
