const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;
const MoneySelector = require('../src/money_selector');

describe('MoneySelector', () => {
  EXAMPLES = [
    ["2000", 2000],
    ["2,000", 2000],
    ["£2,000", 2000],
    ["$2,000.00", 2000],
    ["foo", null],
  ];

  EXAMPLES.forEach(function (example) {
    const [input, output] = example

    it(`parses ${input} into ${output}`, () => {
      const parsed = MoneySelector.parse(input);
      expect(parsed).to.equal(output);
    });
  });
});
