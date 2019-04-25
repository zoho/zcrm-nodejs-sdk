'user strict';

/**
 * The Token class is used to create OAuth tokens for local storage that emulate the mySQL functionality
 */
class Token {
  constructor(tokenData) {
    this.useridentifier = tokenData.user_identifier;
    this.accesstoken = tokenData.access_token;
    this.refreshtoken = tokenData.refresh_token;
    this.expirytime = tokenData.expiry_time;
  }

  get user_identifier() {
    return this.useridentifier;
  }

  set user_identifier(value) {
    this.useridentifier = value;
  }

  get access_token() {
    return this.accesstoken;
  }

  set access_token(value) {
    this.accesstoken = value;
  }

  get refresh_token() {
    return this.refreshtoken;
  }

  set refresh_token(value) {
    this.refreshtoken = value;
  }

  get expiry_time() {
    return this.expirytime;
  }

  set expiry_time(value) {
    this.expirytime = value;
  }

  /**
   * Updates the access token and expiry time for a locally stored token
   *
   * @param {object} tokenValues Object with `access_token` and `expiry_time` values
   */
  update(tokenValues) {
    this.access_token = tokenValues.access_token;
    this.expiry_time = tokenValues.expiry_time;
  }
}

module.exports = Token;
