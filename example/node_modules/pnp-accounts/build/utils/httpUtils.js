'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.respond = respond;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var debug = (0, _debug2['default'])('accounts:http');

function respond(controller) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  var fieldFromBody = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  return function (req, res, next) {
    var objectFromBody = undefined;
    if (fieldFromBody === true) {
      objectFromBody = req.body;
    } else if (!fieldFromBody.length) {
      objectFromBody = fieldFromBody.reduce(function (obj, field) {
        obj[field] = req.body[field];
      }, {});
    } else {
      objectFromBody = req;
    }

    if (typeof controller.then === 'function') {
      controller.apply(undefined, args.concat([objectFromBody, req])).then(function (result) {
        debug('result ', result);
        res.send(result);
      })['catch'](function (error) {
        debug('error ', error);
        next(error);
      });
    } else {
      try {
        var result = controller.apply(undefined, args.concat([objectFromBody, req]));
        debug('result ', result);
        res.send(result);
      } catch (error) {
        debug('error ', error);
        next(error);
      }
    }
  };
}