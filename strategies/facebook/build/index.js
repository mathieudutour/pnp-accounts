'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.verify = verify;
exports.register = register;

var _passportFacebook = require('passport-facebook');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var debug = (0, _debug2['default'])('accounts:strategy-facebook');

function verify(db, options, profile, accessToken) {
  var user, userByEmail, userWithFacebook, userConfig, userCreated;
  return _regeneratorRuntime.async(function verify$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        debug('authentication reply from fb');
        debug(JSON.stringify(profile, null, 4));

        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(db.Users.findOne({ 'services.facebook.id': profile.id }));

      case 4:
        user = context$1$0.sent;

        if (!user) {
          context$1$0.next = 8;
          break;
        }

        debug('user already exist: ', user);
        return context$1$0.abrupt('return', { user: user });

      case 8:

        debug('no fb profile registered');
        context$1$0.next = 11;
        return _regeneratorRuntime.awrap(db.Users.findOne({ emails: { $elemMatch: { address: profile._json.email } } }));

      case 11:
        userByEmail = context$1$0.sent;

        if (!userByEmail) {
          context$1$0.next = 18;
          break;
        }

        debug('email already registered, updating facebookId field');
        context$1$0.next = 16;
        return _regeneratorRuntime.awrap(db.Users.updateById(userByEmail._id, { $set: {
            'services.facebook': {
              id: profile.id,
              accessToken: accessToken
            }
          } }));

      case 16:
        userWithFacebook = context$1$0.sent;
        return context$1$0.abrupt('return', { user: userWithFacebook });

      case 18:
        userConfig = {
          username: profile.name.givenName + ' ' + profile.name.middleName + ' ' + profile.name.familyName,
          emails: [{ address: profile._json.email, verified: true }],
          profile: {
            firstName: profile.name.givenName,
            lastName: profile.name.familyName
          },
          role: 'User',
          services: {
            facebook: {
              id: profile.id,
              accessToken: accessToken
            }
          }
        };

        _Object$keys(options.fieldsToKeep || []).forEach(function (field) {
          userConfig.profile[field] = profile._json[field];
        });

        debug('creating user: ', userConfig);
        context$1$0.next = 23;
        return _regeneratorRuntime.awrap(db.Users.insert(userConfig));

      case 23:
        userCreated = context$1$0.sent;

        debug('register created new user ', userCreated);
        return context$1$0.abrupt('return', { user: userCreated });

      case 26:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
}

function register(passport, options, db) {
  if (options.clientID) {
    debug('configuring facebook authentication strategy');
    var facebookStrategy = new _passportFacebook.Strategy(options, function then(req, accessToken, refreshToken, profile, done) {
      var res;
      return _regeneratorRuntime.async(function then$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.prev = 0;
            context$2$0.next = 3;
            return _regeneratorRuntime.awrap(verify(db, options, profile, accessToken, refreshToken));

          case 3:
            res = context$2$0.sent;

            done(res.err, res.user);
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
    passport.use('facebook', facebookStrategy);
  }
}

// Create user