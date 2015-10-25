import {Strategy} from 'passport-facebook';
import Debug from 'debug';
const debug = Debug('accounts:strategy-facebook');

export async function verify(db, options, profile, accessToken) {
  debug('authentication reply from fb');
  debug(JSON.stringify(profile, null, 4));

  const user = await db.Users.findOne({'services.facebook.id': profile.id});

  if (user) {
    debug('user already exist: ', user);
    return {user};
  }

  debug('no fb profile registered');
  const userByEmail = await db.Users.findOne({emails: { $elemMatch: { address: profile._json.email } }});

  if (userByEmail) {
    debug('email already registered, updating facebookId field');
    const userWithFacebook = await db.Users.updateById(userByEmail._id, {$set: {
      'services.facebook': {
        id: profile.id,
        accessToken,
      },
    }});
    return {user: userWithFacebook};
  }

  // Create user
  const userConfig = {
    username: `${profile.name.givenName} ${profile.name.middleName} ${profile.name.familyName}`,
    emails: [
      {address: profile._json.email, verified: true},
    ],
    profile: {
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
    },
    role: 'User',
    services: {
      facebook: {
        id: profile.id,
        accessToken,
      },
    },
  };

  Object.keys(options.fieldsToKeep || []).forEach(field => {
    userConfig.profile[field] = profile._json[field];
  });

  debug('creating user: ', userConfig);
  const userCreated = await db.Users.insert(userConfig);
  debug('register created new user ', userCreated);
  return {user: userCreated};
}

export function register(passport, options, db) {
  if (options.clientID) {
    debug('configuring facebook authentication strategy');
    const facebookStrategy = new Strategy(options,
      async function then(req, accessToken, refreshToken, profile, done) {
        try {
          const res = await verify(db, options, profile, accessToken, refreshToken);
          done(res.err, res.user);
        } catch (err) {
          done(err);
        }
      });
    passport.use('facebook', facebookStrategy);
  }
}
