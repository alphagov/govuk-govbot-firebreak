const levenshtein = require('fast-levenshtein');

class Levenshtein {
  static distance(a, b) {
    return levenshtein.get(a.toLowerCase(), b.toLowerCase());
  }

  static normalizedDistance(a, b) {
    const levenshteinDistance = levenshtein.get(a.toLowerCase(), b.toLowerCase());
    const minDistance = Math.abs(a.length - b.length);
    const maxDistance = Math.max(a.length, b.length);
    return (levenshteinDistance - minDistance) / (maxDistance - minDistance);
  }
}

module.exports = Levenshtein;
