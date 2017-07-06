const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;
const DateSelector = require('../src/date_selector');

describe('DateSelector', () => {
  const testCases = [
    {
      input: '04/07/2014',
      expects: '2014-07-04',
    },
    {
      input: '4/7/2014',
      expects: '2014-07-04',
    },
    {
      input: '4 Jul 14',
      expects: '2014-07-04',
    },
    {
      input: "July 4th 14",
      expects: null,
    },
    {
      input: "foo",
      expects: null,
    },
    {
      input: "Jul 4 1988",
      expects: "1988-07-04",
    },
    {
      input: "4 Jul 88",
      expects: "1988-07-04",
    }
  ];

  testCases.forEach(testCase => {
    it(`should parse "${testCase.input}" as "${testCase.expects}"`, () => {
      const date = DateSelector.parse(testCase.input);
      expect(date).to.equal(testCase.expects);
    });
  });
});
