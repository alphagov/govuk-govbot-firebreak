const SmartAnswerApi = require('./smart_answer_api');
const MultipleChoiceSelector = require('./multiple_choice_selector');
const DateSelector = require('./date_selector');
const CountrySelector = require('./country_selector');
const MoneySelector = require('./money_selector');
const moment = require('moment');
const Utterances = require('./utterances');
const EmojiInterpreter = require('./emoji_interpreter');
const RangeSelector = require('./range_selector');

const QuestionType = {
  MULTIPLE_CHOICE: 'multiple_choice_question',
  COUNTRY: 'country_select_question',
  DATE: 'date_question',
  MONEY: 'money_question',
  CHECKBOX: 'checkbox_question',
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
      this.handleError(content);
      this.askNextQuestion(content);
    } else {
      this.concludeConversation(content);
    }
  }

  handleError(content) {
    if (content.error) {
      this.choices.pop();
      this.conversation.say("Sorry, but I'm not sure what you meant. Could you please be more specific?");
    }
  }

  askNextQuestion(content) {
    const message = this.buildMessage(content);
    this.chunkMessage(message).forEach(chunk => this.conversation.say(chunk));
    if (content.question_type === QuestionType.CHECKBOX) {
      this.askAboutCheckboxes(content);
    } else {
      this.conversation.ask('', this.receiveMessage(content));
      this.conversation.next();
    }
  }

  concludeConversation(content) {
    if (content.outcome) {
      this.conversation.say(content.outcome);
    } else {
      this.conversation.say("Unfortunately I don't have a short answer for you.");
    }
    this.conversation.say(
      `For a more detailed answer, please visit https://www.gov.uk/${this.basePath}/y/${this.choices.join('/')}`
    );
    this.conversation.next();
  }

  receiveMessage(content) {
    return (response) => {
      if (Utterances.matches(response.text, Utterances.stop)) {
        this.conversation.say("I'm sorry I couldn't help you.");
        this.conversation.next();
        return;
      }

      if (Utterances.matches(response.text, Utterances.goBack)) {
        this.conversation.say("Right. Let's try that again.");
        this.choices.pop();
        this.nextResponse();
        return;
      }

      let answer = this.parseResponse(response, content);

      if (!answer.slug) {
        this.conversation.say("I'm sorry, I don't understand.");
        this.askNextQuestion(content);
        return;
      }

      this.conversation.say(
        `OK. I think you picked: ${answer.humanText}`
      );
      this.conversation.next();

      this.choices.push(answer.slug);

      this.bot.reply(this.conversation.source_message, {
        sender_action: 'typing_on',
      });

      this.nextResponse();
    };
  }

  parseResponse(response, content) {
    const responseText = EmojiInterpreter.interpret(response.text);

    let answer;
    switch (content.question_type) {
      case QuestionType.MULTIPLE_CHOICE:
        console.info("Parsing as Multiple Choice");
        const multipleChoiceAnswers = this.multipleChoiceAnswers(content);
        const optionsText = multipleChoiceAnswers.map(answer => answer.humanText);

        let choiceIndex;
        if (RangeSelector.canSelectFrom(optionsText)) {
          choiceIndex = RangeSelector.select(responseText, optionsText);
        } else {
          choiceIndex = MultipleChoiceSelector.findMatchIndex(responseText, optionsText);
        }

        answer = {
          slug: multipleChoiceAnswers[choiceIndex].keyForUrl,
          humanText: multipleChoiceAnswers[choiceIndex].humanText,
        };
        break;
      case QuestionType.COUNTRY:
        console.info("Parsing as Country");
        const countrySelector = new CountrySelector();
        answer = countrySelector.findCountry(responseText);
        break;
      case QuestionType.DATE:
        console.info("Parsing as Date");
        const date = DateSelector.parse(responseText);
        answer = {
          slug: date,
          humanText: moment(date).format('Do MMMM YYYY'),
        };
        break;
      case QuestionType.MONEY:
        console.info("Parsing as Money");
        const money = MoneySelector.parse(responseText);
        answer = {
          slug: money,
          humanText: money && money.toLocaleString('en-GB',
            {style: 'currency', currency: 'GBP', currencyDisplay: 'symbol'}),
        };
        break;
      default:
        console.info("Parsing as Free text");
        answer = {
          slug: responseText,
          humanText: responseText,
        };
    }

    console.info(`Interpreted answer as: "${answer.slug}"`);
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
      .filter(component => !!(component.trim()))
      .join('\n\n');
  }

  multipleChoiceAnswers(content) {
    if (content.question_type === QuestionType.COUNTRY || content.question_type === QuestionType.CHECKBOX) {
      return [];
    }

    return content.questions.map((answer, index) => {
      return {
        index: index,
        humanText: `${index + 1}. ${answer.label}`,
        keyForUrl: answer.value,
      };
    });
  }

  askAboutCheckboxes(content, answers) {
    answers = answers || [];

    if (answers.length >= content.questions.length) {
      const selectedAnswers = answers.reduce((array, answer, index) => {
        const question = content.questions[index];
        if (answer && question) {
          array.push(question);
        }
        return array;
      }, []);

      const selectedSlugs = selectedAnswers.map(answer => answer.value).join(',');
      const answerSummary = selectedAnswers.map(answer => answer.label).join('; ');

      this.choices.push(selectedSlugs);
      this.conversation.say(`OK. You picked the following: ${answerSummary}.`);
      this.nextResponse();
      return;
    }

    const question = content.questions[answers.length].label + '?';
    this.conversation.ask(question, (response) => {
      const responseText = EmojiInterpreter.interpret(response.text);

      if (Utterances.matches(responseText, Utterances.yes)) {
        answers.push(true);
      } else if (Utterances.matches(responseText, Utterances.no)) {
        answers.push(false);
      } else if (Utterances.matches(responseText, Utterances.skip)) {
        while (answers.length < content.questions.length) {
          answers.push(false);
        }
      } else {
        this.conversation.say("I'm sorry, I don't understand.");
      }

      this.askAboutCheckboxes(content, answers);
    });
    this.conversation.next();
  }

  chunkMessage(message) {
    const roughChunkLength = 300;
    let currentCharacterIndex = roughChunkLength;
    let previousChunkEndIndex = 0;

    const chunks = [];

    while (message[currentCharacterIndex]) {
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
