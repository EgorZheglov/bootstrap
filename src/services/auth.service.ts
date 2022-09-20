import to from 'await-to-js';

import cache from '../libs/node-cache';
import refreshTokensCache from '../libs/refresh-tokens-cache';
import { AUTH_CONNECTION, HASH_EXPIRES, PASSWORD_SALT } from '../config';
import { AuthUserResponse, RegisterUser, UserLoginInfo } from '../types';
import { activateUser, findByEmail } from '../controllers/user-controller';
import { error } from '../libs/log';
import { errors } from '../messages';
import {
  findByActivationToken,
  getAuth0Token,
} from '../controllers/tokens-controller';
import tokenModel from '../db/models/activation-token';
import accessTokensCache from '../libs/access-tokens-cache';
import auth0api from '../libs/auth0-api';
import createHash from '../libs/hash-maker';
import db from '../db/db';
import encryptString from '../libs/encrypt-string';
import jwt from '../libs/jwt';
import userModel from '../db/models/user';
import { updateOrCreateAuthToken } from '../data-access/auth-token.dao';
import roles from '../libs/roles';

const {
  USER_NOT_FOUND,
  SHOULD_CONTAINS_TOKEN,
  CANNOT_CREATE_USER,
  PASSWORD_NOT_CORRECT,
  PASSWORD_AND_CONFIRM_NOT_MATCH,
  INCORRECT_TOKEN,
  EXPIRED_ACTIVATION_TOKEN,
  ERROR_CONNECTION_DB_TOKEN,
} = errors;

export const signup = async (payload: RegisterUser): Promise<string> => {
  if (payload.password !== payload.confirm_password) {
    error(PASSWORD_AND_CONFIRM_NOT_MATCH);
    throw PASSWORD_AND_CONFIRM_NOT_MATCH;
  }

  const [tokenErr, tokenResponse] = await to(getAuth0Token());
  if (tokenErr || !tokenResponse) {
    error(tokenErr);
    throw CANNOT_CREATE_USER;
  }

  const authBody = {
    username: payload.name,
    email: payload.email,
    password: encryptString(
      `${encryptString(payload.password)}${PASSWORD_SALT}`
    ),
    connection: AUTH_CONNECTION,
  };
  const [authError, authResponse] = await to<AuthUserResponse>(
    auth0api.post('/api/v2/users', authBody, {
      headers: {
        Authorization: `Bearer ${tokenResponse}`,
      },
    })
  );
  if (authError || !authResponse) {
    error(authError);
    throw CANNOT_CREATE_USER;
  }

  const [dbErr, dbResponse] = await to(
    db.query(userModel.addUser, [
      payload.name,
      payload.email,
      payload.password,
      payload.role,
    ])
  );
  if (dbErr || !dbResponse) {
    error(dbErr);
    throw CANNOT_CREATE_USER;
  }

  const expiresDate = new Date(Date.now() + HASH_EXPIRES);
  const hash = createHash({
    email: authResponse.data.email,
    name: authResponse.data.name,
    username: authResponse.data.username,
  });
  const [dbTokenErr, dbTokenResponse] = await to(
    db.query(tokenModel.addToken, [payload.email, hash, expiresDate])
  );
  if (dbTokenErr || !dbTokenResponse) {
    error(dbTokenErr);
    throw CANNOT_CREATE_USER;
  }

  return hash;
};

export const login = async (
  user: UserLoginInfo
): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  const [err, data] = await to(findByEmail(user.email, roles.userAndAdmin));
  if (err || !data) {
    error(err);
    throw USER_NOT_FOUND;
  }

  if (data.password !== user.password) {
    error(PASSWORD_NOT_CORRECT);
    throw PASSWORD_NOT_CORRECT;
  }

  cache.del(user.ip);
  const { accessToken, refreshToken } = jwt.create({
    email: data.email,
    role: data.role,
  });
  // creating/updating database with access and refresh token
  const [dbUpdateErr] = await to(
    updateOrCreateAuthToken(data.email, accessToken, refreshToken)
  );
  if (dbUpdateErr) {
    error(dbUpdateErr);
    throw ERROR_CONNECTION_DB_TOKEN;
  }

  refreshTokensCache.set(refreshToken, {
    email: user.email,
    accessToken,
    role: data.role,
  });
  accessTokensCache.set(accessToken, user.email);
  return { accessToken, refreshToken };
};

export const logout = async (token: any): Promise<boolean> => {
  if (!token || typeof token !== 'string' || token.length === 0) {
    error(SHOULD_CONTAINS_TOKEN);
    throw SHOULD_CONTAINS_TOKEN;
  }
  accessTokensCache.del(token);
  return true;
};

export const verifyEmail = async (token: string): Promise<boolean> => {
  const [err, data] = await to(findByActivationToken(token));
  if (err || !data || !data.expires_in) {
    error(INCORRECT_TOKEN);
    throw INCORRECT_TOKEN;
  }
  if (data.expires_in.getTime() < new Date().getTime()) {
    error(EXPIRED_ACTIVATION_TOKEN);
    throw EXPIRED_ACTIVATION_TOKEN;
  }
  await activateUser(data.email);
  return true;
};
