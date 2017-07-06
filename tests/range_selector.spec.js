const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;
const RangeSelector = require('../src/range_selector');

describe('RangeSelector', () => {
  describe('picking between energy grant house property dates', () => {
    const answers = [
      {
        "label": "1995 or newer",
        "value": "on-or-after-1995"
      },
      {
        "label": "1940s – 1994",
        "value": "1940s-1984"
      },
      {
        "label": "Before 1940",
        "value": "before-1940"
      },
    ].map(answer => answer.label);

    const testCases = [
      {
        input: 1996,
        expects: 0,
      },
      {
        input: 1995,
        expects: 0,
      },
      {
        input: 1994,
        expects: 1,
      },
      {
        input: 1945,
        expects: 1,
      },
      {
        input: 1944,
        expects: 1,
      },
      {
        input: 1940,
        expects: 1,
      },
      {
        input: 1939,
        expects: 2,
      }
    ];

    it('can pick from these options', () => {
      expect(RangeSelector.canSelectFrom(answers)).to.be.true;
    });

    testCases.forEach(testCase => {
      it(`can select "${testCase.input}"`, () => {
        const selectedIndex = RangeSelector.select(testCase.input, answers);
        expect(selectedIndex).to.equal(testCase.expects);
      });
    });
  });

  describe('picking a number of months for visas', () => {
    const answers = [
      {
        "label": "6 months or less",
        "value": "six_months_or_less"
      },
      {
        "label": "longer than 6 months",
        "value": "longer_than_six_months"
      },
    ].map(answer => answer.label);

    const testCases = [
      {
        input: 6,
        expects: 0,
      },
      {
        input: 3,
        expects: 0,
      },
      {
        input: 7,
        expects: 1,
      },
      {
        input: '6 months',
        expects: 0,
      },
      {
        input: '7 months',
        expects: 1,
      }
    ];

    it('can pick from these options', () => {
      expect(RangeSelector.canSelectFrom(answers)).to.be.true;
    });

    testCases.forEach(testCase => {
      it(`can select "${testCase.input}"`, () => {
        const selectedIndex = RangeSelector.select(testCase.input, answers);
        expect(selectedIndex).to.equal(testCase.expects);
      });
    });
  });

  describe("picking from options that aren't ranges", () => {
    const answers = [1, 2, 3, 4];
    it('cannot select from these options', () => {
      expect(RangeSelector.canSelectFrom(answers)).to.be.false;
    });
  });
});
