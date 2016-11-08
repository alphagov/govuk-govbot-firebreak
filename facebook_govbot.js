var Botkit = require('./lib/Botkit.js');
var os = require('os');
var request = require('sync-request');

var controller = Botkit.facebookbot({
    debug: true,
    access_token: process.env.page_token,
    verify_token: process.env.verify_token,
});

var bot = controller.spawn({});

controller.setupWebserver(process.env.port || 3000, function(err, webserver) {
  controller.createWebhookEndpoints(webserver, bot, function() {
    console.log('ONLINE!');
  });
});

function getContent(smartAnswerSlug, currentState) {
  // Use local smart answer branch (has extra API stuff)
  var url = 'https://smart-answers-with-api.herokuapp.com/' + smartAnswerSlug + '/y' + currentState + '.json'
  console.log("REQUESTING", url);

  var res = request('GET', url);
  return JSON.parse(res.body)['chatbot_payload'];
}

function splitTextIntoParts(input) {
  var len = 300;
  var curr = len;
  var prev = 0;

  output = [];

  while (input[curr]) {
    if (input[curr++] == ' ') {
        output.push(input.substring(prev,curr));
        prev = curr;
        curr += len;
    }
  }

  output.push(input.substr(prev));

  return output;
}

function startSmartAnswerConversation(smartAnswerSlug, convo) {
  askNextSmartAnswerQuestion("", convo);

  function askNextSmartAnswerQuestion(currentState, convo) {
    var content = getContent(smartAnswerSlug, currentState)

    if (content.state == "asking") {
      var index = 0;
      var questionTable = [];

      content.questions.map(function (question) {
        index++;
        questionTable.push({ index: index, humanText: question.label, keyForUrl: question.value });
      });

      var questionTexts = questionTable.map(function (question) {
        return question.index + ": " + question.humanText
      }).join("\n");

      var introString = content.title + "\n\n"

      if (content.body) {
        introString = introString + content.body;
      }

      if (questionTable.length > 0) {
        introString = introString + questionTexts + "\n\n";
      }

      if (content.hint) {
        introString = introString + content.hint;
      }

      splitTextIntoParts(introString).forEach(function (message) {
        convo.say(message)
      })

      var callback = function(response, convo) {
        var answer = questionTable.find(function (q) {
          return q.index == response.text;
        })

        if (answer) {
          var nextState = currentState + '/' + answer.keyForUrl;
          console.log("interpreting answer as answer to '" + answer.humanText + "'")
        } else {
          // free form text input can be validated / parsed using answer.question_type.
          var nextState = currentState + '/' + response.text;
          console.log("interpreting answer as free text: " + response.text)
        }

        bot.reply(convo.source_message, { sender_action: "typing_on" });
        askNextSmartAnswerQuestion(nextState, convo);
        convo.next()
      }

      convo.ask("", callback)
    } else {
      convo.say(content.outcome);
      convo.say("For more a more detailed outcome, go to GOV.UK: https://www.gov.uk/" + smartAnswerSlug + "/y" + currentState);
    }
  }
}

var HELLO = new RegExp(/^(hey|hello|hi|help|yo)/i);

controller.hears([HELLO], 'message_received', function(bot, message) {
  bot.reply(message, "Hi! I am Govbot. I can answer certain questions about government services. What do you want to know?")
})

var emoji = require('node-emoji')

controller.on('message_received', function(bot, message) {
  console.log(message.text)
  var emojiTranslation = emoji.which(message.text)

  if (emojiTranslation) {
    var input = emojiTranslation.replace('_', ' ');
  } else {
    var input = message.text
  }

  // Use search to fetch the smart answer the user could be looking for
  var res = request('GET', 'https://www.gov.uk/api/search.json?filter_rendering_app=smartanswers&fields[]=title,link&count=1&q=' + input);
  var searchResult = JSON.parse(res.body)['results'][0];

  if (!searchResult) {
    bot.reply(message, "I can't find anything related to '" + input + "'. Could you be more specific?")
    return;
  }

  bot.startConversation(message, function(err, convo) {
    convo.ask('Are you looking for "' + searchResult.title + '"?', [
      {
        pattern: bot.utterances.yes,
        callback: function(response, convo) {
          convo.say("OK. I'm going to start asking some questions..")
          var smartAnswerSlug = searchResult.link.replace('/', '');
          startSmartAnswerConversation(smartAnswerSlug, convo);
          convo.next();
        }
      },
      {
        pattern: bot.utterances.no,
        default: true,
        callback: function(response, convo) {
          convo.say('Okay, are you looking for something else?');
          convo.next();
        }
      }
    ]);
  });
});
