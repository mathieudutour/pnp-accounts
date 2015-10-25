'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _PassportAuth = require('./PassportAuth');

var _PassportAuth2 = _interopRequireDefault(_PassportAuth);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _monk = require('monk');

var _monk2 = _interopRequireDefault(_monk);

// Routes

var _apiAuthentication = require('./api/Authentication');

var _apiAuthentication2 = _interopRequireDefault(_apiAuthentication);

var _apiUsers = require('./api/Users');

var _apiUsers2 = _interopRequireDefault(_apiUsers);

var _apiMe = require('./api/Me');

var _apiMe2 = _interopRequireDefault(_apiMe);

var _merge = require('merge');

var _merge2 = _interopRequireDefault(_merge);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function setupAuthentication(options, db) {
  var auth = new _PassportAuth2['default'](options, db);
  return auth;
}

var PnpAccounts = (function () {
  function PnpAccounts(options) {
    _classCallCheck(this, PnpAccounts);

    this.options = _merge2['default'].recursive(true, /* clone */_config2['default'], options);

    this._initDB();
    this.auth = setupAuthentication(options, this.db);

    this._routers = {
      users: (0, _apiUsers2['default'])(options, this.auth, this.db),
      me: (0, _apiMe2['default'])(options, this.auth, this.db),
      authentication: (0, _apiAuthentication2['default'])(options, this.auth, this.db)
    };

    this.middlewares = {
      ensureAuthenticated: this.auth.ensureAuthenticated,
      isAuthorized: this.auth.isAuthorized
    };

    // this.jobs = {
    //   mail: new MailJob(config),
    // };
  }

  _createClass(PnpAccounts, [{
    key: '_initDB',
    value: function _initDB() {
      this.db = (0, _monk2['default'])(this.options.db.host);
      this.db.Users = this.db.get(this.options.db.usersCollection);
      this.db.PendingUsers = this.db.get(this.options.db.pendingUsersCollection);
      this.db.PasswordReset = this.db.get(this.options.db.passwordResetCollection);
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      return this.auth.initialize();
    }
  }, {
    key: 'session',
    value: function session() {
      return this.auth.session();
    }
  }, {
    key: 'router',
    get: function get() {
      var router = new _express2['default'].Router();
      router.use('/auth', this._routers.authentication);
      router.use('/', this.auth.ensureAuthenticated, this._routers.users);
      router.use('/', this.auth.ensureAuthenticated, this._routers.me);
      return router;
    }
  }]);

  return PnpAccounts;
})();

exports['default'] = PnpAccounts;
module.exports = exports['default'];