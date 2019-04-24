/*
 * Module handles local storage of Oauth access tokens
 */

/**
  * Array of token objects that were generated with the refresh token stored in the oauth configuration file
  */
// const TOKENS = [];

// /**
//   * Generates a new authorization token using a provided
//   *
//   * @param {object} opts
//   */
// const generateToken = (opts) => {

// };

const toExport = {
  saveOAuthTokens: (tokenObj) => {
    console.log('---- saveOAuthTokens ----');
    console.log(tokenObj);

    return Promise.resolve([{}]);
  },

  updateOAuthTokens: (tokenObj) => {
    console.log('---- updateOAuthTokens ----');
    console.log(tokenObj);

    return Promise.resolve([{}]);
  },

  getOAuthTokens: (userIdentifier) => {
    console.log('---- getOAuthTokens ----');
    console.log(tokenObj);

    return Promise.resolve([{}]);
  }
};

module.exports = toExport;
