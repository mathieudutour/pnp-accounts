'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  db: {
    host: 'localhost/mydb',
    usersCollection: 'users',
    pendingUsersCollection: 'pending_users',
    passwordResetCollection: 'password_reset'
  },
  crypto: {
    rounds: 10,
    secret: 'moqziehfqbzeufhbcqy' },
  // random rain of finger on keyboard
  authentication: {
    local: {
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: false,
      profileFields: [/* list of fields to insert in the profile (in addition to `email` and `username`) */],
      shouldVerifyEmail: true
    },
    facebook: {
      // clientID,
      // clientSecret,
      // callbackURL,
      enableProof: false,
      profileFields: ['id', 'email', 'gender', 'name', 'verified'],
      scope: ['email'],
      fieldsToKeep: ['gender']
    }
  },
  failureRedirect: '/login',
  successRedirect: '',
  shouldVerifyEmail: true,
  shouldCreateAccount: function shouldCreateAccount(user) {
    if (!user.password || user.password.length < 8) {
      return {
        code: 400,
        name: 'passwordTooShort',
        message: 'password too short (should be at least 8 characters)'
      };
    }
    if (!user.email || !user.email.length) {
      return {
        code: 400,
        name: 'missingEmail',
        message: 'missing email'
      };
    }
    return true;
  },
  checkUserPermission: function checkUserPermission() /* user, path, method */{
    return new _Promise(function (resolve) {
      return resolve(true);
    });
  }
};
module.exports = exports['default'];