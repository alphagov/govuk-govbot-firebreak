var Botkit = require('./lib/Botkit.js');
var os = require('os');
var request = require('sync-request');
var emoji = require('node-emoji')

const SmartAnswerConversation = require('./src/smart_answer_conversation');
const EmojiInterpreter = require('./src/emoji_interpreter');

var controller = Botkit.facebookbot({
  debug: true,
  access_token: process.env.page_token,
  verify_token: process.env.verify_token,
});

var bot = controller.spawn({});

controller.setupWebserver(process.env.PORT || 3000, function (err, webserver) {
  controller.createWebhookEndpoints(webserver, bot, function () {
  });
});

controller.on('tick', function (bot, event) {
  // do not log debug `ticks`
});

// The first conversation
var HELLO = new RegExp(/^(hey|hello|hi|help|yo)/i);

controller.hears([HELLO], 'message_received', function (bot, message) {
  bot.reply(message, "Hi! I am Govbot Alpha. I can answer certain questions about government services. Please be aware that I am a highly experimental, unofficial service. Do not base life decisions on my answers. Also be aware that all your questions and answers are recorded and WILL be looked at by humans.\n\nWhat do you want to know? I know about your pension, visa requirements, and much more.")
})

controller.on('message_received', function (bot, message) {
  console.log("INCOMING MESSAGE: ", message)

  const input = EmojiInterpreter.interpret(message.text);

  console.log("INTERPRETED MESSAGE TEXT: ", input)

  // Use search to fetch the smart answer the user could be looking for
  var res = request('GET', 'https://www.gov.uk/api/search.json?filter_rendering_app=smartanswers&fields[]=title,link&count=1&q=' + input);
  const body = JSON.parse(res.body);
  const result = body && body.results && body.results[0];

  if (!result) {
    bot.reply(message, "Sorry, I can't find anything related to '" + input + "'. Could you be more specific?")
    return;
  }

  bot.startConversation(message, function (err, convo) {
    convo.ask('Are you looking for "' + result.title + '"?', [
      {
        pattern: bot.utterances.yes,
        callback: function (response, convo) {
          convo.say("OK. I'm going to start asking some questions.");
          var smartAnswerSlug = result.link.replace('/', '');
          SmartAnswerConversation.start(smartAnswerSlug, bot, convo);
          convo.next();
        }
      },
      {
        pattern: bot.utterances.no,
        default: true,
        callback: function (response, convo) {
          convo.say('Okay, what other thing are you looking for?');
          convo.next();
        }
      }
    ]);
  });
});
