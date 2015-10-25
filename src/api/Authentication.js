import passport from 'passport';
import express from 'express';
import {respond} from '../utils/httpUtils';
import {hash} from '../utils/bcrypt-promise';
import Debug from 'debug';
const debug = Debug('accounts:authentication');
import {JWTToken, Token} from '../utils/token';
import moment from 'moment';

module.exports = (options, auth, db) => {
  function login({user}) {
    debug('login', user);
    return user;
  }

  async function register(userPendingIn) {
    debug('createPending: ', userPendingIn);
    let user = await db.Users.findOne({emails: { $elemMatch: { address: userPendingIn.email } } });

    if (user) {
      debug('already registered', userPendingIn.email);
      throw new Error('email already registered');
    }

    const shouldCreateAccount = options.shouldCreateAccount(userPendingIn);
    if (shouldCreateAccount !== true) {
      debug('should not create user', shouldCreateAccount);
      throw new Error(shouldCreateAccount);
    }

    const code = Token();

    const userToCreate = {
      username: userPendingIn.username,
      emails: [
        {address: userPendingIn.email, verified: false, code},
      ],
      password: hash(userPendingIn.password, options),
      role: 'User',
      profile: {},
      services: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    options.profileFields.forEach(field => {
      userToCreate.profile[field] = userPendingIn[field];
    });

    user = await db.Users.insert(userToCreate);

    if (!options.authentication.password.shouldVerifyEmail) { // TODO add an option to still send verification email
      // create directly a token and send the user
      const token = JWTToken(user, options.crypto.secret);
      user = await db.Users.updateById(user._id, {$set: {services: {token}}});
      debug('created user ', user);
      return user;
    }

    debug('createPending code ', code);
    // TODO send confirm email
    return {
      success: true,
      message: 'confirm email',
    };
  }

  async function verifyEmailCode({code}) {
    let user = await db.Users.findOne({emails: { $elemMatch: { code } } });

    if (!user) {
      debug('verifyEmailCode: no such code ', code);
      throw {
        code: 422,
        name: 'NoSuchCode',
        message: 'Code not found',
      };
    }

    debug('verifyEmailCode: userPending: ', user);
    user = await db.Users.update({emails: { $elemMatch: { code } } },
      {$set: {'emails.$.verified': true}, $unset: {'emails.$.code': ''}});
    debug('verifyEmailCode: user ', user);
    return user;
  }

  async function resetPassword({email}) {
    debug('resetPassword: ', email);
    const user = await db.Users.findOne({emails: { $elemMatch: { address: email } } });

    if (!user) {
      debug('resetPassword: no such email: ', email);
      throw {
        code: 404,
        name: 'NoSuchEmail',
        message: 'Email not found',
      };
    }

    debug('resetPassword: find user: ', user);
    const token = Token();
    await db.Users.updateById(user._id,
      {$set: {'services.resetPassword': {
        token,
        createdAt: new Date(),
      }}});

    // TODO send password reset email with the token.
    const passwordResetPublished = {
      code: token,
      email: user.email,
    };
    debug('resetPassword: publish: ', passwordResetPublished);

    return {
      success: true,
    };
  }

  async function verifyResetPasswordToken({token, password}) {
    debug('verifyResetPasswordToken: ', token);
    // Has the token expired ?

    // find the user
    const user = await db.Users.findOne({'services.resetPassword.token': token});

    if (!user) {
      debug('verifyResetPasswordToken: no such token ', token);
      throw {
        code: 422,
        name: 'TokenInvalid',
      };
    }

    if (moment().diff(user.services.resetPassword.createdAt, 'minutes') > 60) {
      debug('verifyResetPasswordToken: token expired', token);
      throw {
        code: 422,
        name: 'TokenExpired',
      };
    }

    debug('verifyResetPasswordToken: password ok');

    await db.Users.updateById(user._id, {$set: {password: hash(password, options)}});

    return {
      success: true,
    };
  }

  function logout(req) {
    debug('logout');
    req.logout();
    return {
      success: true,
    };
  }

  const router = new express.Router();

  const {local, ...otherStrategies} = options.authentication;

  if (local) {
    router.post('/login', passport.authenticate('login'), respond(login));
    router.post('/register', respond(register, true));
    router.post('/verify_email_code', respond(verifyEmailCode, ['code']));
    router.post('/reset_password', respond(resetPassword, ['email']));
    router.post('/verify_reset_password_token', respond(verifyResetPasswordToken, ['email', 'token']));
  }

  router.post('/logout', auth.ensureAuthenticated, respond(logout));

  Object.keys(otherStrategies || {}).forEach(strategy => {
    const strategyOptions = options.authentication[strategy];
    if (!strategyOptions) { return; }

    router.get('/' + strategy, passport.authenticate(strategy, { scope: strategyOptions.scope }));
    router.get('/' + strategy + '/callback',
      passport.authenticate('facebook', {
        failureRedirect: options.failureRedirect,
        successRedirect: options.successRedirect,
      }));
  });

  return {
    router,
    login,
    register,
    verifyEmailCode,
    resetPassword,
    verifyResetPasswordToken,
    logout,
  };
};
