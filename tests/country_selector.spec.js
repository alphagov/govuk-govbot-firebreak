const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;
const CountrySelector = require('../src/country_selector');

describe('CountrySelector', () => {
  const countrySelector = new CountrySelector();

  it("can find 'Great Britain'", () => {
    const country = countrySelector.findCountry('Great Britain');
    expect(country.slug).to.equal('united-kingdom');
  });

  it("can find 'holland'", () => {
    const country = countrySelector.findCountry('holland');
    expect(country.slug).to.equal('netherlands');
  });

  it("can find 'US'", () => {
    const country = countrySelector.findCountry('US');
    expect(country.slug).to.equal('usa');
  });

  it("can find 'amrca'", () => {
    const country = countrySelector.findCountry('amrca');
    expect(country.slug).to.equal('usa');
  });
});
