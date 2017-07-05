const request = require('sync-request');

class SmartAnswerApi {
  static fetch(basePath, choices) {
    // Use local smart answer branch (has extra API stuff)
    const url = `https://gov-bot-one.herokuapp.com/${basePath}/y/${choices.join('/')}.json`;
    console.info(`GET ${url}`);

    const response = request('GET', url);
    return JSON.parse(response.body)['chatbot_payload'];
  }
}

module.exports = SmartAnswerApi;
