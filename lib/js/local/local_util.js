/*
 * Module handles local storage of Oauth access tokens
 */

const Token = require('./token.js');
const crmclient = require('../ZCRMRestClient');

/**
  * Array of token objects that were generated with the refresh token stored in the oauth configuration file
  */
const TOKENS = [];

/**
 * Attempts to find a token using a unique user identifier
 *
 * @param {string} user_identifier The unique identifier for this user
 * @return {object} The token object associated with this user
 */
const findToken = (user_identifier) => {
  return TOKENS.find((item) => item.user_identifier === user_identifier);
};

const localUtils = {
  saveOAuthTokens: (tokenData) => {
    TOKENS.push(new Token(tokenData));
    return Promise.resolve();
  },

  updateOAuthTokens: (tokenData) => {
    // First try to find the correct token
    const user_identifier = tokenData.user_identifier || crmclient.getUserIdentifier();
    const found = findToken(user_identifier);

    if (!found) throw new Error(`Unable to find locally stored token for user: ${user_identifier}`);
    found.update(tokenData);

    return Promise.resolve();
  },

  getOAuthTokens: (user_identifier) => {
    if (!user_identifier) user_identifier = crmclient.getUserIdentifier();
    let found = findToken(user_identifier);

    // If we couldn't find a token make a new stub token with the correct user and resolve with it - this will
    // trigger a token update
    if (!found) {
      found = new Token({
        user_identifier,
        access_token: null,
        refresh_token: crmclient.getRefreshToken(),
        expiry_time: 0
      });
      TOKENS.push(found);
    }

    return Promise.resolve([found]);
  }
};

module.exports = localUtils;
