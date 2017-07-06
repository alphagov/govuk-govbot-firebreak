const emoji = require('node-emoji');

class EmojiInterpreter {
  static interpret(emojiCharacter) {
    if (!emojiCharacter) {
      return emojiCharacter;
    }

    if (EmojiInterpreter.isNumber(emojiCharacter)) {
      return emojiCharacter;
    }

    let translation = emoji.which(emojiCharacter);

    if (translation) {
      translation = translation.replace(/_/g, ' ');
      console.info(`Interpreting "${emojiCharacter}" as "${translation}"`);
      return translation;
    } else {
      return emojiCharacter;
    }
  }

  static isNumber(character) {
    const characterAsInt = parseInt(character);
    return !Number.isNaN(characterAsInt);
  }
}

module.exports = EmojiInterpreter;
