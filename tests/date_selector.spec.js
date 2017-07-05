const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;
const DateSelector = require('../src/date_selector');

describe('DateSelector', () => {
  it('can parse DD/MM/YYYY', () => {
    const date = DateSelector.parse('04/07/2017');
    expect(date).to.equal('2017-07-04');
  });

  it('can parse DD-MM-YYYY', () => {
    const date = DateSelector.parse('04-07-2017');
    expect(date).to.equal('2017-07-04');
  });

  it('can parse D MMM YY', () => {
    const date = DateSelector.parse('4 Jul 17');
    expect(date).to.equal('2017-07-04');
  });

  it("can parse MMMM Dth 'YY", () => {
    const date = DateSelector.parse("July 4th '17");
    expect(date).to.equal('2017-07-04');
  });

  it("returns null for garbage", () => {
    const date = DateSelector.parse("foo");
    expect(date).to.be.null;
  });
});
