const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;
const MultipleChoiceSelector = require('../src/multiple_choice_selector');

describe('MultipleChoiceSelector', () => {
  describe('Picking between state pension age and bus pass age', () => {
    const options = [
      "1. State Pension age - including Pension Credit qualifying age",
      "2. Bus pass age - find out when you'll get free bus travel",
    ];

    describe('picking by option number', () => {
      it('can pick the first option with the string "1"', () => {
        const selectionIndex = MultipleChoiceSelector.findMatchIndex('1', options);
        expect(selectionIndex).to.equal(0);
      });

      it('can pick the second option with the string "2"', () => {
        const selectionIndex = MultipleChoiceSelector.findMatchIndex('2', options);
        expect(selectionIndex).to.equal(1);
      });

      it('can pick the second option with the number 2', () => {
        const selectionIndex = MultipleChoiceSelector.findMatchIndex(2, options);
        expect(selectionIndex).to.equal(1);
      });
    });

    describe('picking by text', () => {
      it('returns the first option when typing in "pension"', () => {
        const selectionIndex = MultipleChoiceSelector.findMatchIndex('pension', options);
        expect(selectionIndex).to.equal(0);
      });

      it('returns the second option when typing in "bus pass"', () => {
        const selectionIndex = MultipleChoiceSelector.findMatchIndex('bus pass', options);
        expect(selectionIndex).to.equal(1);
      });

      it('returns the second option when typing in "bs psas', () => {
        const selectionIndex = MultipleChoiceSelector.findMatchIndex('bs psas', options);
        expect(selectionIndex).to.equal(1);
      });

      it('returns the second option when typing in "I would please like to know about getting a free bus pass"', () => {
        const selectionIndex = MultipleChoiceSelector.findMatchIndex(
          "I would please like to know about getting a free bus pass",
          options,
        );
        expect(selectionIndex).to.equal(1);
      });
    });
  });

  describe("Picking between being a Man or a Woman", () => {
    const options = ["1. Man", "2. Woman"];

    it('returns the first option when typing in "Man"', () => {
      const selectionIndex = MultipleChoiceSelector.findMatchIndex('man', options);
      expect(selectionIndex).to.equal(0);
    });

    it('returns the second option when typing in "Woman"', () => {
      const selectionIndex = MultipleChoiceSelector.findMatchIndex('woman', options);
      expect(selectionIndex).to.equal(1);
    });
  });
});
