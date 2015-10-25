'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var debug = (0, _debug2['default'])('accounts:passport');

exports['default'] = function (options, db) {
  if (options.authentication && _Object$keys(options.authentication).length) {
    _Object$keys(options.authentication).forEach(function (strategy) {
      if (options.authentication[strategy]) {
        var _ref = require('pnp-accounts-' + strategy) || {};

        var register = _ref.register;

        register(_passport2['default'], options.authentication[strategy], db);
      }
    });
  }

  _passport2['default'].serializeUser(function (user, done) {
    debug('serializeUser ', user);
    // TODO use redis
    done(null, user._id);
  });

  _passport2['default'].deserializeUser(function (id, done) {
    debug('deserializeUser ', id);
    // TODO use redis
    db.Users.findOneById(id, done);
  });

  function ensureAuthenticated(req, res, next) {
    debug('ensureAuthenticated ', req.url);
    if (!req.isAuthenticated()) {
      debug('ensureAuthenticated KO: ', req.url);
      return res.status(401).send('Unauthorized');
    }
    return next();
  }

  function isAuthorized(req, res, next) {
    if (!req.user) {
      return next({ error: 'UserNotSet' });
    }
    var routePath = req.route.path;
    debug('isAuthorized: who:%s, resource:%s, method %s', req.user._id, routePath, req.method);

    options.checkUserPermission(req.user, routePath, req.method).then(function (authorized) {
      debug('isAuthorized ', authorized);
      if (authorized) {
        next();
      } else {
        res.status(401).send();
      }
    });
  }

  return {
    initialize: _passport2['default'].initialize,
    session: _passport2['default'].session,
    ensureAuthenticated: ensureAuthenticated,
    isAuthorized: isAuthorized
  };
};

module.exports = exports['default'];