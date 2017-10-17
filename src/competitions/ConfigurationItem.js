class ConfigurationItem {
  constructor(key, type, name, info = 'leave empty to use the competition\'s default value') {
    this.key = key;
    this.type = type;
    this.name = name;
    this.info = info;
  }
}

module.exports = ConfigurationItem;
