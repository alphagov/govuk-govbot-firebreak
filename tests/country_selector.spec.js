const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;
const CountrySelector = require('../src/country_selector');

describe('CountrySelector', () => {
  const countrySelector = new CountrySelector();

  const testCases = [
    {
      input: "Great Britain",
      expected: "united-kingdom",
    },
    {
      input: "holland",
      expected: "netherlands",
    },
    {
      input: 'US',
      expected: 'usa',
    },
    {
      input: 'amrca',
      expected: 'usa',
    },
    {
      input: 'dutch',
      expected: 'netherlands',
    }
  ];

  testCases.forEach(testCase => {
    it(`can find "${testCase.input}"`, () => {
      const country = countrySelector.findCountry(testCase.input);
      expect(country.slug).to.equal(testCase.expected);
    });
  });
});
