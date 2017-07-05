class MoneySelector {
  static parse(input) {
    return input.replace(/[^0-9\.]+/g,"");
  }
}

module.exports = MoneySelector;
