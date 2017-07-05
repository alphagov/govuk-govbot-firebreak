const fs = require('fs');
const Levenshtein = require('./levenshtein');

class CountrySelector {
  constructor() {
    const countryJson = fs.readFileSync('data/country_names.json');
    this.countries = JSON.parse(countryJson);
  }

  findCountrySlug(searchTerm) {
    const countryLevenshteinDistances = this.countries
      .map(country => {
        return {
          slug: country.slug,
          levenshtein: this.minimumDistanceForSynonyms(searchTerm, country.synonyms),
          normalizedLevenshtein: this.minimumNormalizedDistanceForSynonyms(searchTerm, country.synonyms),
        };
      })
      .sort((a, b) => {
        const normalizedDifference = a.normalizedLevenshtein - b.normalizedLevenshtein;
        if (normalizedDifference !== 0) {
          return normalizedDifference;
        } else {
          return a.levenshtein - b.levenshtein;
        }
      });

    return countryLevenshteinDistances[0].slug;
  }

  minimumNormalizedDistanceForSynonyms(searchTerm, countrySynonyms) {
    const distancesForSynonyms = countrySynonyms.map(synonym => {
      return Levenshtein.normalizedDistance(searchTerm, synonym);
    });

    return Math.min(...distancesForSynonyms);
  }

  minimumDistanceForSynonyms(searchTerm, countrySynonyms) {
    const distancesForSynonyms = countrySynonyms.map(synonym => {
      return Levenshtein.distance(searchTerm, synonym);
    });

    return Math.min(...distancesForSynonyms);
  }
}

module.exports = CountrySelector;
