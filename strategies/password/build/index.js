'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.verifyLogin = verifyLogin;
exports.register = register;

var _passportLocal = require('passport-local');

var _utils = require('./utils');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var debug = (0, _debug2['default'])('accounts:passport-local');

function verifyLogin(db, shouldVerifyEmail, shouldDistinguishErrors, username, password) {
  var queryEmail, user, result;
  return _regeneratorRuntime.async(function verifyLogin$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        debug('verify username: ', username);
        queryEmail = { emails: { $elemMatch: { address: username } } };

        if (shouldVerifyEmail) {
          queryEmail.emails.$elemMatch.verified = true;
        }
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(db.Users.findOne({ $or: [queryEmail, { username: username }] }));

      case 5:
        user = context$1$0.sent;

        if (user) {
          context$1$0.next = 9;
          break;
        }

        debug('invalid username user: ', username);
        throw {
          error: {
            message: shouldDistinguishErrors ? 'InvalidUsername' : 'InvalidUsernameOrPassword'
          }
        };

      case 9:
        result = (0, _utils.compare)(password, user.password);

        if (result) {
          context$1$0.next = 13;
          break;
        }

        debug('invalid password user: ', user);
        throw {
          error: {
            message: shouldDistinguishErrors ? 'InvalidPassword' : 'InvalidUsernameOrPassword'
          }
        };

      case 13:

        debug('userBasic valid password for user: ', user);
        return context$1$0.abrupt('return', { user: user });

      case 15:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function register(passport, options, db) {
  debug('configuring local authentication strategy');
  var loginStrategy = new _passportLocal.Strategy(options, function then(username, password, done) {
    var res;
    return _regeneratorRuntime.async(function then$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          context$2$0.prev = 0;
          context$2$0.next = 3;
          return _regeneratorRuntime.awrap(verifyLogin(db, options.shouldVerifyEmail, options.shouldDistinguishErrors, username, password));

        case 3:
          res = context$2$0.sent;

          done(null, res.user);
          context$2$0.next = 10;
          break;

        case 7:
          context$2$0.prev = 7;
          context$2$0.t0 = context$2$0['catch'](0);

          done(context$2$0.t0);

        case 10:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this, [[0, 7]]);
  });

  passport.use('login', loginStrategy);
}