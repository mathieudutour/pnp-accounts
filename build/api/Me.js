'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _utilsHttpUtils = require('../utils/httpUtils');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _utilsToken = require('../utils/token');

var debug = (0, _debug2['default'])('accounts:me');

exports['default'] = function (options, auth, db) {
  function getMe(user) {
    debug('index userId: ', user._id);
    return user;
  }

  function addEmail(_ref, user) {
    var email = _ref.email;
    var userAlready, code, updatedUser;
    return _regeneratorRuntime.async(function addEmail$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          debug('addEmail: ', email);
          context$2$0.next = 3;
          return _regeneratorRuntime.awrap(db.Users.findOne({ emails: { $elemMatch: { address: email } } }));

        case 3:
          userAlready = context$2$0.sent;

          if (!userAlready) {
            context$2$0.next = 7;
            break;
          }

          debug('already registered', userAlready);
          throw new Error('email already registered');

        case 7:
          code = (0, _utilsToken.Token)();
          context$2$0.next = 10;
          return _regeneratorRuntime.awrap(db.Users.updateById(user._id, { $push: { emails: {
                address: email,
                verified: false,
                code: code
              } } }));

        case 10:
          updatedUser = context$2$0.sent;

          if (!(!options.authentication.password || options.authentication.password.shouldVerifyEmail)) {
            context$2$0.next = 13;
            break;
          }

          return context$2$0.abrupt('return', updatedUser);

        case 13:

          debug('createPending code ', code);
          // TODO send confirm email
          return context$2$0.abrupt('return', {
            success: true,
            message: 'confirm email'
          });

        case 15:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this);
  }

  var router = new _express2['default'].Router();

  router.get('/me', auth.isAuthorized, (0, _utilsHttpUtils.respond)(getMe));
  router.post('/me/email', auth.isAuthorized, (0, _utilsHttpUtils.respond)(addEmail, ['email']));

  return {
    router: router,
    getMe: getMe,
    addEmail: addEmail
  };
};

module.exports = exports['default'];
// TODO add an option to still send verification email