import {Strategy as LocalStrategy} from 'passport-local';
import {compare} from './utils';
import Debug from 'debug';
const debug = Debug('accounts:passport-local');

export async function verifyLogin(db, shouldVerifyEmail, shouldDistinguishErrors, username, password) {
  debug('verify username: ', username);
  const queryEmail = {emails: { $elemMatch: { address: username } }};
  if (shouldVerifyEmail) {
    queryEmail.emails.$elemMatch.verified = true;
  }
  const user = await db.Users.findOne({$or: [queryEmail, {username: username}]});

  if (!user) {
    debug('invalid username user: ', username);
    throw {
      error: {
        message: shouldDistinguishErrors ? 'InvalidUsername' : 'InvalidUsernameOrPassword',
      },
    };
  }

  const result = compare(password, user.password);

  if (!result) {
    debug('invalid password user: ', user);
    throw {
      error: {
        message: shouldDistinguishErrors ? 'InvalidPassword' : 'InvalidUsernameOrPassword',
      },
    };
  }

  debug('userBasic valid password for user: ', user);
  return {user};
}

export function register(passport, options, db) {
  debug('configuring local authentication strategy');
  const loginStrategy = new LocalStrategy(options,
    async function then(username, password, done) {
      try {
        const res = await verifyLogin(db, options.shouldVerifyEmail, options.shouldDistinguishErrors, username, password);
        done(null, res.user);
      } catch (err) {
        done(err);
      }
    }
  );

  passport.use('login', loginStrategy);
}
