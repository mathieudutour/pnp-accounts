import express from 'express';
import {respond} from '../utils/httpUtils';
import Debug from 'debug';
const debug = Debug('accounts:users');

export default (options, auth, db) => {
  async function list({query}) {
    debug('list query: ', query);
    return await db.Users.find(query);
  }

  async function get({params: {id}}) {
    debug('get userId: ', id);
    return await db.Users.findById(id);
  }

  const router = new express.Router();

  // Users /users
  router.get('/users', auth.isAuthorized, respond(list));
  router.get('/users/:id', auth.isAuthorized, respond(get));

  return {
    router,
    list,
    get,
  };
};
