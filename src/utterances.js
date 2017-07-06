class Utterances {
  static matches(input, utterances) {
    return utterances.some(utterance => {
      return new RegExp(`^${utterance}$`, 'i').test(input);
    });
  }
}

Utterances.stop = [
  'stop',
  'exit',
  'quit',
  'go away',
  'shut up',
];

module.exports = Utterances;
