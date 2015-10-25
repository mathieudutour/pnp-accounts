import express from 'express';
import {respond} from '../utils/httpUtils';
import Debug from 'debug';
const debug = Debug('accounts:me');
import {Token} from '../utils/token';

export default (options, auth, db) => {
  function getMe(user) {
    debug('index userId: ', user._id);
    return user;
  }

  async function addEmail({email}, user) {
    debug('addEmail: ', email);
    const userAlready = await db.Users.findOne({emails: { $elemMatch: { address: email } } });

    if (userAlready) {
      debug('already registered', userAlready);
      throw new Error('email already registered');
    }

    const code = Token();

    const updatedUser = await db.Users.updateById(user._id, {$push: {emails: {
      address: email,
      verified: false,
      code,
    }}});

    if (!options.authentication.password || options.authentication.password.shouldVerifyEmail) { // TODO add an option to still send verification email
      return updatedUser;
    }

    debug('createPending code ', code);
    // TODO send confirm email
    return {
      success: true,
      message: 'confirm email',
    };
  }

  const router = new express.Router();

  router.get('/me', auth.isAuthorized, respond(getMe));
  router.post('/me/email', auth.isAuthorized, respond(addEmail, ['email']));

  return {
    router,
    getMe,
    addEmail,
  };
};
