class RangeSelector {
  static select(value, ranges) {
    const numberExtractor = /([\d|.]+)/ig;
    const matches = value.toString().match(numberExtractor);
    if (!matches || !matches[0]) {
      return null;
    }

    const extractedValue = parseInt(matches[0]);

    const predicates = RangeSelector.parseRanges(ranges);
    const choiceIndex = predicates.findIndex(predicate => {
      return predicate(extractedValue);
    });

    if (choiceIndex < 0 || choiceIndex >= ranges.length) {
      return null;
    } else {
      return choiceIndex;
    }
  }

  static canSelectFrom(wordyRanges) {
    const predicates = RangeSelector.parseRanges(wordyRanges);
    return predicates.every(predicate => !!predicate);
  }

  static parseRanges(wordyRanges) {
    return wordyRanges.map(wordyRange => {
      const bounds = RangeSelector.bounds(wordyRange);

      if (!bounds) {
        return null;
      }

      if (bounds.length === 2) {
        return (test) => {
          return test >= bounds[0] && test <= bounds[1];
        };
      }

      if (bounds.length === 1) {
        const inclusive = RangeSelector.isInclusive(wordyRange);
        const greaterThan = RangeSelector.isGreaterThan(wordyRange);
        const lessThan = RangeSelector.isLessThan(wordyRange);

        if (RangeSelector.xor(greaterThan, lessThan)) {
          return (test) => {
            if (inclusive && test === bounds[0]) {
              return true;
            }
            if (greaterThan) {
              return test > bounds[0];
            } else {
              return test < bounds[0];
            }
          };
        }
      }

      return null;
    });
  }

  static isInclusive(wordyRange) {
    return /\b(or|between|-)\b/i.test(wordyRange);
  }

  static isGreaterThan(wordyRange) {
    return /\b(newer|after|later|more|greater|longer)\b/i.test(wordyRange);
  }

  static isLessThan(wordyRange) {
    return /\b(before|older|prior|less|fewer|shorter)\b/i.test(wordyRange);
  }

  static bounds(wordyRange) {
    if (typeof wordyRange !== 'string') {
      return null;
    }
    const regex = /([\d|.]+)/ig;
    const matches = wordyRange.match(regex);
    return matches && matches
        .map(match => parseFloat(match))
        .sort();
  }

  static xor(a, b) {
    return a ? !b : b;
  }
}

module.exports = RangeSelector;
