class Utterances {
  static matches(input, utterances) {
    return utterances.some(utterance => {
      return new RegExp(utterance, 'i').test(input);
    });
  }
}

Utterances.yes = [
  /^(yes|yea|yup|yep|ya|sure|ok|y|yeah|yah)$/,
  /^\+1$/,
];

Utterances.no = [
  /^(no|nah|nope|n)$/,
  /^-1$/,
];

Utterances.stop = [
  /^(quit|cancel|end|stop|nevermind|never mind)$/,
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

Utterances.skip = [
  /^skip$/,
  /^next$/,
  /^next step$/,
];

module.exports = Utterances;
