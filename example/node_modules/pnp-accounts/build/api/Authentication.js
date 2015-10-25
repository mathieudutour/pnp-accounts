'use strict';

var _objectWithoutProperties = require('babel-runtime/helpers/object-without-properties')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _utilsHttpUtils = require('../utils/httpUtils');

var _utilsBcryptPromise = require('../utils/bcrypt-promise');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _utilsToken = require('../utils/token');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var debug = (0, _debug2['default'])('accounts:authentication');

module.exports = function (options, auth, db) {
  function login(_ref) {
    var user = _ref.user;

    debug('login', user);
    return user;
  }

  function register(userPendingIn) {
    var user, shouldCreateAccount, code, userToCreate, token;
    return _regeneratorRuntime.async(function register$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          debug('createPending: ', userPendingIn);
          context$2$0.next = 3;
          return _regeneratorRuntime.awrap(db.Users.findOne({ emails: { $elemMatch: { address: userPendingIn.email } } }));

        case 3:
          user = context$2$0.sent;

          if (!user) {
            context$2$0.next = 7;
            break;
          }

          debug('already registered', userPendingIn.email);
          throw new Error('email already registered');

        case 7:
          shouldCreateAccount = options.shouldCreateAccount(userPendingIn);

          if (!(shouldCreateAccount !== true)) {
            context$2$0.next = 11;
            break;
          }

          debug('should not create user', shouldCreateAccount);
          throw new Error(shouldCreateAccount);

        case 11:
          code = (0, _utilsToken.Token)();
          userToCreate = {
            username: userPendingIn.username,
            emails: [{ address: userPendingIn.email, verified: false, code: code }],
            password: (0, _utilsBcryptPromise.hash)(userPendingIn.password, options),
            role: 'User',
            profile: {},
            services: {},
            createdAt: new Date(),
            updatedAt: new Date()
          };

          options.profileFields.forEach(function (field) {
            userToCreate.profile[field] = userPendingIn[field];
          });

          context$2$0.next = 16;
          return _regeneratorRuntime.awrap(db.Users.insert(userToCreate));

        case 16:
          user = context$2$0.sent;

          if (options.shouldVerifyEmail) {
            context$2$0.next = 24;
            break;
          }

          token = (0, _utilsToken.JWTToken)(user, options.crypto.secret);
          context$2$0.next = 21;
          return _regeneratorRuntime.awrap(db.Users.updateById(user._id, { $set: { services: { token: token } } }));

        case 21:
          user = context$2$0.sent;

          debug('created user ', user);
          return context$2$0.abrupt('return', user);

        case 24:

          debug('createPending code ', code);
          // TODO send confirm email
          return context$2$0.abrupt('return', {
            success: true,
            message: 'confirm email'
          });

        case 26:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this);
  }

  function verifyEmailCode(_ref2) {
    var code = _ref2.code;
    var user;
    return _regeneratorRuntime.async(function verifyEmailCode$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          context$2$0.next = 2;
          return _regeneratorRuntime.awrap(db.Users.findOne({ emails: { $elemMatch: { code: code } } }));

        case 2:
          user = context$2$0.sent;

          if (user) {
            context$2$0.next = 6;
            break;
          }

          debug('verifyEmailCode: no such code ', code);
          throw {
            code: 422,
            name: 'NoSuchCode',
            message: 'Code not found'
          };

        case 6:

          debug('verifyEmailCode: userPending: ', user);
          context$2$0.next = 9;
          return _regeneratorRuntime.awrap(db.Users.update({ emails: { $elemMatch: { code: code } } }, { $set: { 'emails.$.verified': true }, $unset: { 'emails.$.code': '' } }));

        case 9:
          user = context$2$0.sent;

          debug('verifyEmailCode: user ', user);
          return context$2$0.abrupt('return', user);

        case 12:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this);
  }

  function resetPassword(_ref3) {
    var email = _ref3.email;
    var user, token, passwordResetPublished;
    return _regeneratorRuntime.async(function resetPassword$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          debug('resetPassword: ', email);
          context$2$0.next = 3;
          return _regeneratorRuntime.awrap(db.Users.findOne({ emails: { $elemMatch: { address: email } } }));

        case 3:
          user = context$2$0.sent;

          if (user) {
            context$2$0.next = 7;
            break;
          }

          debug('resetPassword: no such email: ', email);
          throw {
            code: 404,
            name: 'NoSuchEmail',
            message: 'Email not found'
          };

        case 7:

          debug('resetPassword: find user: ', user);
          token = (0, _utilsToken.Token)();
          context$2$0.next = 11;
          return _regeneratorRuntime.awrap(db.Users.updateById(user._id, { $set: { 'services.resetPassword': {
                token: token,
                createdAt: new Date()
              } } }));

        case 11:
          passwordResetPublished = {
            code: token,
            email: user.email
          };

          debug('resetPassword: publish: ', passwordResetPublished);

          return context$2$0.abrupt('return', {
            success: true
          });

        case 14:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this);
  }

  function verifyResetPasswordToken(_ref4) {
    var token = _ref4.token;
    var password = _ref4.password;
    var user;
    return _regeneratorRuntime.async(function verifyResetPasswordToken$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          debug('verifyResetPasswordToken: ', token);
          // Has the token expired ?

          // find the user
          context$2$0.next = 3;
          return _regeneratorRuntime.awrap(db.Users.findOne({ 'services.resetPassword.token': token }));

        case 3:
          user = context$2$0.sent;

          if (user) {
            context$2$0.next = 7;
            break;
          }

          debug('verifyResetPasswordToken: no such token ', token);
          throw {
            code: 422,
            name: 'TokenInvalid'
          };

        case 7:
          if (!((0, _moment2['default'])().diff(user.services.resetPassword.createdAt, 'minutes') > 60)) {
            context$2$0.next = 10;
            break;
          }

          debug('verifyResetPasswordToken: token expired', token);
          throw {
            code: 422,
            name: 'TokenExpired'
          };

        case 10:

          debug('verifyResetPasswordToken: password ok');

          context$2$0.next = 13;
          return _regeneratorRuntime.awrap(db.Users.updateById(user._id, { $set: { password: (0, _utilsBcryptPromise.hash)(password, options) } }));

        case 13:
          return context$2$0.abrupt('return', {
            success: true
          });

        case 14:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this);
  }

  function logout(req) {
    debug('logout');
    req.logout();
    return {
      success: true
    };
  }

  var router = new _express2['default'].Router();

  var _options$authentication = options.authentication;
  var local = _options$authentication.local;

  var otherStrategies = _objectWithoutProperties(_options$authentication, ['local']);

  if (local) {
    router.post('/login', _passport2['default'].authenticate('login'), (0, _utilsHttpUtils.respond)(login));
    router.post('/register', (0, _utilsHttpUtils.respond)(register, true));
    router.post('/verify_email_code', (0, _utilsHttpUtils.respond)(verifyEmailCode, ['code']));
    router.post('/reset_password', (0, _utilsHttpUtils.respond)(resetPassword, ['email']));
    router.post('/verify_reset_password_token', (0, _utilsHttpUtils.respond)(verifyResetPasswordToken, ['email', 'token']));
  }

  router.post('/logout', auth.ensureAuthenticated, (0, _utilsHttpUtils.respond)(logout));

  _Object$keys(otherStrategies || {}).forEach(function (strategy) {
    var strategyOptions = options.authentication[strategy];
    if (!strategyOptions) {
      return;
    }

    router.get('/' + strategy, _passport2['default'].authenticate(strategy, { scope: strategyOptions.scope }));
    router.get('/' + strategy + '/callback', _passport2['default'].authenticate('facebook', {
      failureRedirect: options.failureRedirect,
      successRedirect: options.successRedirect
    }));
  });

  return {
    router: router,
    login: login,
    register: register,
    verifyEmailCode: verifyEmailCode,
    resetPassword: resetPassword,
    verifyResetPasswordToken: verifyResetPasswordToken,
    logout: logout
  };
};
// TODO add an option to still send verification email
// create directly a token and send the user

// TODO send password reset email with the token.