'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.JWTToken = JWTToken;
exports.Token = Token;

var _jwtSimple = require('jwt-simple');

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _chance = require('chance');

var _chance2 = _interopRequireDefault(_chance);

var chance = new _chance2['default']();

function JWTToken(iss, secret) {
  var expires = (0, _moment2['default'])().add(365, 'days').valueOf();
  var token = _jwtSimple2['default'].encode({
    iss: iss,
    exp: expires
  }, secret);
  return { token: token, expires: expires };
}

function Token() {
  return chance.string({
    length: 16,
    pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  });
}