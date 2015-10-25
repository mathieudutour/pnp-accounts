import PassportAuth from './PassportAuth';
import express from 'express';
import monk from 'monk';

// Routes
import AuthenticationRoutes from './api/Authentication';
import UsersRoutes from './api/Users';
import MeRoutes from './api/Me';

import merge from 'merge';

import DEFAULTS from './config';

function setupAuthentication(options, db) {
  const auth = new PassportAuth(options, db);
  return auth;
}

export default class PnpAccounts {
  constructor(options) {
    this.options = merge.recursive(true/* clone */, DEFAULTS, options);

    this._initDB();
    this.auth = setupAuthentication(options, this.db);

    this._routers = {
      users: UsersRoutes(options, this.auth, this.db),
      me: MeRoutes(options, this.auth, this.db),
      authentication: AuthenticationRoutes(options, this.auth, this.db),
    };

    this.middlewares = {
      ensureAuthenticated: this.auth.ensureAuthenticated,
      isAuthorized: this.auth.isAuthorized,
    };

    // this.jobs = {
    //   mail: new MailJob(config),
    // };
  }

  _initDB() {
    this.db = monk(this.options.db.host);
    this.db.Users = this.db.get(this.options.db.usersCollection);
    this.db.PendingUsers = this.db.get(this.options.db.pendingUsersCollection);
    this.db.PasswordReset = this.db.get(this.options.db.passwordResetCollection);
  }

  get router() {
    const router = new express.Router();
    router.use('/auth', this._routers.authentication);
    router.use('/', this.auth.ensureAuthenticated, this._routers.users);
    router.use('/', this.auth.ensureAuthenticated, this._routers.me);
    return router;
  }

  initialize() {
    return this.auth.initialize();
  }

  session() {
    return this.auth.session();
  }
}
