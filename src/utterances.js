class Utterances {
  static matches(input, utterances) {
    return utterances.some(utterance => {
      return new RegExp(utterance, 'i').test(input);
    });
  }
}

Utterances.stop = [
  /^stop$/,
  /^exit$/,
  /^quit$/,
  /^go away$/,
  /^quit$/,
];

Utterances.goBack = [
  /^back$/,
  /^go back$/,
  /that's not/,
  /that is not/,
  /not what i/,
  /^no\b.+\w+/,
];

module.exports = Utterances;
