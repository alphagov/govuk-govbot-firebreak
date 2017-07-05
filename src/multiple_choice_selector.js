const Levenshtein = require('./levenshtein');

class MultipleChoiceSelector {
  static findMatchIndex(selection, options) {
    const optionFromSelectionIndex = this.findOptionFromSelectionIndex(selection, options);
    if (typeof optionFromSelectionIndex === 'number') {
      return optionFromSelectionIndex;
    }

    return this.findOptionFromSelectionText(selection, options);
  }

  static findOptionFromSelectionIndex(selection, options) {
    const selectionAsInt = parseInt(selection);
    if (Number.isNaN(selectionAsInt) || selectionAsInt > options.length || selectionAsInt <= 0) {
      return null;
    }
    return selectionAsInt - 1;
  }

  static findOptionFromSelectionText(selection, options) {
    const levenshteinDistances = options
      .map((option, index) => {
        return {
          index: index,
          option: option,
          levenshtein: Levenshtein.distance(selection, option),
          normalizedLevenshtein: Levenshtein.normalizedDistance(selection, option),
        };
      })
      .sort((a, b) => {
        let normalizedDifference = a.normalizedLevenshtein - b.normalizedLevenshtein;
        if (normalizedDifference !== 0) {
          return normalizedDifference;
        } else {
          // Break ties by using the non-normalized distance (see the Man/Woman test case)
          return a.levenshtein - b.levenshtein;
        }
      });

    return levenshteinDistances[0].index;
  }
}

module.exports = MultipleChoiceSelector;
