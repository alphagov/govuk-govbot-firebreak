const chrono = require('chrono-node').en_GB;

class DateSelector {
  static parse(date) {
    let parsedDate = chrono.parseDate(date);
    return `${parsedDate.getFullYear()}-${DateSelector.zeroPad(parsedDate.getMonth() + 1)}-${DateSelector.zeroPad(parsedDate.getDate())}`;
  }

  static zeroPad(number) {
    return ('00' + number).slice(-2);
  }
}

module.exports = DateSelector;
