const SmartAnswerApi = require('./smart_answer_api');
const MultipleChoiceSelector = require('./multiple_choice_selector');
const DateSelector = require('./date_selector');
const CountrySelector = require('./country_selector');

const QuestionType = {
  MULTIPLE_CHOICE: 'multiple_choice_question',
  COUNTRY: 'country_select_question',
  DATE: 'date_question',
};

class SmartAnswerConversation {
  constructor(basePath, bot, conversation) {
    this.basePath = basePath;
    this.bot = bot;
    this.conversation = conversation;
    this.choices = [];
  }

  static start(basePath, bot, conversation) {
    const smartAnswerConversation = new SmartAnswerConversation(basePath, bot, conversation);
    smartAnswerConversation.nextResponse();
  }

  nextResponse() {
    const content = SmartAnswerApi.fetch(this.basePath, this.choices);
    if (content.state === 'asking') {
      this.askNextQuestion(content);
    } else {
      this.concludeConversation(content);
    }
  }

  askNextQuestion(content) {
    const message = this.buildMessage(content);
    this.chunkMessage(message).forEach(chunk => this.conversation.say(chunk));
    this.conversation.ask('', this.receiveMessage(content));
    this.conversation.next();
  }

  concludeConversation(content) {
    this.conversation.say(content.outcome);
    this.conversation.say(
      `For a more detailed answer, please visit https://www.gov.uk/${this.basePath}/y/${this.choices.join('/')}`
    );
    this.conversation.next();
  }

  receiveMessage(content) {
    return (response) => {
      if (response.text.toLowerCase() === 'stop') {
        this.conversation.reply("I'm sorry I couldn't help you.");
        this.conversation.next();
        return;
      }

      const answer = this.parseResponse(response, content);

      this.conversation.reply(
        `OK. I think you picked: ${answer}`
      );
      this.conversation.next();

      // TODO: Allow user to change response?

      this.choices.push(answer);

      this.bot.reply(this.conversation.source_message, {
        sender_action: 'typing_on',
      });

      this.askNextQuestion();
    };
  }

  parseResponse(response, content) {
    let answer;
    switch (content.question_type) {
      case QuestionType.MULTIPLE_CHOICE:
        console.info("Parsing as Multiple Choice");
        const multipleChoiceAnswers = this.multipleChoiceAnswers(content);
        const optionsText = multipleChoiceAnswers.map(answer => answer.humanText);
        const choiceIndex = MultipleChoiceSelector.findMatchIndex(response.text, optionsText);
        answer = multipleChoiceAnswers[choiceIndex].keyForUrl;
        break;
      case QuestionType.COUNTRY:
        console.info("Parsing as Country");
        const countrySelector = new CountrySelector();
        answer = countrySelector.findCountrySlug(response.text);
        break;
      case QuestionType.DATE:
        console.info("Parsing as Date");
        answer = DateSelector.parse(response.text);
        break;
      default:
        console.info("Parsing as Free text");
        answer = response.text;
    }

    console.info(`Interpreted answer as: "${answer}"`);
    return answer;
  }

  buildMessage(content) {
    const multipleChoiceAnswers = this.multipleChoiceAnswers(content);

    const messageComponents = [
      content.title,
      content.body,
      ...multipleChoiceAnswers.map(question => question.humanText),
      content.hint,
    ];

    return messageComponents
      .filter(component => !!component)
      .join('\n\n');
  }

  multipleChoiceAnswers(content) {
    return content.questions.map((answer, index) => {
      return {
        index: index,
        humanText: `${index}. ${answer.label}`,
        keyForUrl: answer.value,
      };
    });
  }

  chunkMessage(message) {
    const roughChunkLength = 300;
    let currentCharacterIndex = roughChunkLength;
    let previousChunkEndIndex = 0;

    const chunks = [];

    while(message[currentCharacterIndex]) {
      if (/\s+/.test(message[currentCharacterIndex++])) {
        chunks.push(
          message.substring(previousChunkEndIndex, currentCharacterIndex)
        );
        previousChunkEndIndex = currentCharacterIndex;
        currentCharacterIndex += roughChunkLength;
      }
    }

    chunks.push(message.substring(previousChunkEndIndex));
    return chunks;
  }
}

module.exports = SmartAnswerConversation;
