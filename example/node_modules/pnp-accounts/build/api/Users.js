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

var debug = (0, _debug2['default'])('accounts:users');

exports['default'] = function (options, auth, db) {
  function list(_ref) {
    var query = _ref.query;
    return _regeneratorRuntime.async(function list$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          debug('list query: ', query);
          context$2$0.next = 3;
          return _regeneratorRuntime.awrap(db.Users.find(query));

        case 3:
          return context$2$0.abrupt('return', context$2$0.sent);

        case 4:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this);
  }

  function get(_ref2) {
    var id = _ref2.params.id;
    return _regeneratorRuntime.async(function get$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          debug('get userId: ', id);
          context$2$0.next = 3;
          return _regeneratorRuntime.awrap(db.Users.findById(id));

        case 3:
          return context$2$0.abrupt('return', context$2$0.sent);

        case 4:
        case 'end':
          return context$2$0.stop();
      }
    }, null, this);
  }

  var router = new _express2['default'].Router();

  // Users /users
  router.get('/users', auth.isAuthorized, (0, _utilsHttpUtils.respond)(list));
  router.get('/users/:id', auth.isAuthorized, (0, _utilsHttpUtils.respond)(get));

  return {
    router: router,
    list: list,
    get: get
  };
};

module.exports = exports['default'];