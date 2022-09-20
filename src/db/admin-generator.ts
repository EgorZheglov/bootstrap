import to from 'await-to-js';

import { error } from '../libs/log';
import jwt from '../libs/jwt';
import { errors } from '../messages';
import roles from '../libs/roles';
import { ADMIN_EMAIL, ADMIN_PASS, ADMIN_NAME, HASH_EXPIRES } from '../config';
import db from './db';
import { findByEmail } from '../data-access/user.dao';
import { activateUser } from '../controllers/user-controller';
import createHash from '../libs/hash-maker';
import userModel from './models/user';
import TokenModel from './models/activation-token';
import { updateOrCreateAuthToken } from '../data-access/auth-token.dao';
import accessTokensCache from '../libs/access-tokens-cache';
import refreshTokensCache from '../libs/refresh-tokens-cache';

const {
  ERROR_WHILE_CHECKING_EXISTED_ADMIN_DB,
  CANNOT_CREATE_USER,
  ERROR_CONNECTION_DB_TOKEN,
  USER_NOT_FOUND,
  PASSWORD_NOT_CORRECT,
} = errors;

export const signIntoAdmin = async () => {
  await db.connect();

  // checking if admin already exists
  const [dbError, dbFindResponse] = await to(
    findByEmail(ADMIN_EMAIL, roles.userAndAdmin)
  );
  if (dbError) {
    error(dbError);
    throw ERROR_WHILE_CHECKING_EXISTED_ADMIN_DB;
  }

  // if account already exists, login; if not – signup first and activating
  if (!dbFindResponse?.id) {
    // making all signup operations
    const [dbErr, dbAddResponse] = await to(
      db.query(userModel.addUser, [
        ADMIN_NAME,
        ADMIN_EMAIL,
        ADMIN_PASS,
        roles.userAndAdmin,
      ])
    );
    if (dbErr || !dbAddResponse) {
      error(dbErr);
      throw CANNOT_CREATE_USER;
    }
    const expiresDate = new Date(Date.now() + HASH_EXPIRES);
    const hash = createHash({
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
    });
    const [dbTokenErr, dbTokenResponse] = await to(
      db.query(TokenModel.addToken, [ADMIN_EMAIL, hash, expiresDate])
    );
    if (dbTokenErr || !dbTokenResponse) {
      error(dbTokenErr);
      throw CANNOT_CREATE_USER;
    }
    await activateUser(ADMIN_EMAIL);
  }
  // login
  const [err, data] = await to(findByEmail(ADMIN_EMAIL, roles.userAndAdmin));
  if (err || !data) {
    error(err);
    throw USER_NOT_FOUND;
  }
  if (data.password !== ADMIN_PASS) {
    error(PASSWORD_NOT_CORRECT);
    throw PASSWORD_NOT_CORRECT;
  }

  const { accessToken, refreshToken } = jwt.create({
    email: ADMIN_EMAIL,
    role: roles.userAndAdmin,
  });
  const [dbUpdateErr] = await to(
    updateOrCreateAuthToken(ADMIN_EMAIL, accessToken, refreshToken)
  );
  if (dbUpdateErr) {
    error(dbUpdateErr);
    throw ERROR_CONNECTION_DB_TOKEN;
  }

  refreshTokensCache.set(refreshToken, {
    email: ADMIN_EMAIL,
    accessToken,
    role: roles.userAndAdmin,
  });
  accessTokensCache.set(accessToken, ADMIN_EMAIL);
  const response = {
    accessToken,
    refreshToken,
  };
  console.log(response);
  await db.disconnect();
  process.exit(0);
};

signIntoAdmin();
