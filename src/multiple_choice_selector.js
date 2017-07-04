const levenshtein = require('fast-levenshtein');

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
          levenshtein: this.levenshteinDistance(selection, option),
          normalizedLevenshtein: this.normalizedLevenshteinDistance(selection, option),
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

  static levenshteinDistance(a, b) {
    return levenshtein.get(a.toLowerCase(), b.toLowerCase());
  }

  static normalizedLevenshteinDistance(a, b) {
    const levenshteinDistance = levenshtein.get(a.toLowerCase(), b.toLowerCase());
    const minDistance = Math.abs(a.length - b.length);
    const maxDistance = Math.max(a.length, b.length);
    return (levenshteinDistance - minDistance) / (maxDistance - minDistance);
  }
}

module.exports = MultipleChoiceSelector;
