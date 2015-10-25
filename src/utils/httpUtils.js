import Debug from 'debug';
const debug = Debug('accounts:http');

export function respond(controller, fieldFromBody = [], ...args) {
  return (req, res, next) => {
    let objectFromBody;
    if (fieldFromBody === true) {
      objectFromBody = req.body;
    } else if (!fieldFromBody.length) {
      objectFromBody = fieldFromBody.reduce((obj, field) => {
        obj[field] = req.body[field];
      }, {});
    } else {
      objectFromBody = req;
    }

    if (typeof controller.then === 'function') {
      controller(...args, objectFromBody, req)
      .then(result => {
        debug('result ', result);
        res.send(result);
      })
      .catch(error => {
        debug('error ', error);
        next(error);
      });
    } else {
      try {
        const result = controller(...args, objectFromBody, req);
        debug('result ', result);
        res.send(result);
      } catch (error) {
        debug('error ', error);
        next(error);
      }
    }
  };
}
