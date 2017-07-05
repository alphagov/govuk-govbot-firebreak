const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;
const CountrySelector = require('../src/country_selector');

describe('CountrySelector', () => {
  const countrySelector = new CountrySelector();

  it("can find 'Great Britain'", () => {
    const slug = countrySelector.findCountrySlug('Great Britain');
    expect(slug).to.equal('united-kingdom');
  });

  it("can find 'holland'", () => {
    const slug = countrySelector.findCountrySlug('holland');
    expect(slug).to.equal('netherlands');
  });

  it("can find 'US'", () => {
    const slug = countrySelector.findCountrySlug('US');
    expect(slug).to.equal('usa');
  });

  it("can find 'amrca'", () => {
    const slug = countrySelector.findCountrySlug('amrca');
    expect(slug).to.equal('usa');
  });
});
