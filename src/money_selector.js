class MoneySelector {
  static parse(input) {
    const cleansedInput = input.replace(/[^0-9.]+/g,"");
    const float = parseFloat(cleansedInput);

    if (Number.isNaN(float) || float < 0) {
      return null;
    }

    return float;
  }
}

module.exports = MoneySelector;
