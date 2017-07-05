const request = require('sync-request');

class SmartAnswerApi {
  static fetch(basePath, choices) {
    // Use local smart answer branch (has extra API stuff)
    const url = `https://smart-answers-with-api.herokuapp.com/${basePath}/y/${choices.join('/')}.json`;
    console.info(`GET ${url}`);

    const response = request('GET', url);
    return JSON.parse(response.body);
  }
}

module.exports = SmartAnswerApi;
