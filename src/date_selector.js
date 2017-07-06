const chrono = require('chrono-node');

class DateSelector {
  static parse(date) {
    const parser = chrono.en_GB;

    let result = parser.parse(date)[0];
    if (!result) {
      return null;
    }

    const parsedDate = result.start.knownValues;

    const year = parsedDate.year;
    const month = parsedDate.month;
    const day = parsedDate.day;

    if (!year || !month || !day) {
      return null;
    }

    return `${year}-${DateSelector.zeroPad(month)}-${DateSelector.zeroPad(day)}`;
  }

  static zeroPad(number) {
    return ('00' + number).slice(-2);
  }
}

module.exports = DateSelector;
