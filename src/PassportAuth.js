import passport from 'passport';
import Debug from 'debug';
const debug = Debug('accounts:passport');

export default function(options, db) {
  if (options.authentication && Object.keys(options.authentication).length) {
    Object.keys(options.authentication).forEach(strategy => {
      if (options.authentication[strategy]) {
        const {register} = require('pnp-accounts-' + strategy) || {};
        register(passport, options.authentication[strategy], db);
      }
    });
  }

  passport.serializeUser((user, done) => {
    debug('serializeUser ', user);
    // TODO use redis
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
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
      return next({error: 'UserNotSet'});
    }
    const routePath = req.route.path;
    debug('isAuthorized: who:%s, resource:%s, method %s', req.user._id, routePath, req.method);

    options.checkUserPermission(req.user, routePath, req.method)
    .then(authorized => {
      debug('isAuthorized ', authorized);
      if (authorized) {
        next();
      } else {
        res.status(401).send();
      }
    });
  }

  return {
    ensureAuthenticated,
    isAuthorized,
  };
}
