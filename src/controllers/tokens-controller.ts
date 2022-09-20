import { AxiosResponse } from 'axios';
import to from 'await-to-js';

import * as dao from '../data-access/activation-token.dao';
import {
  ACCESS_TOKEN_CACHE_TTL,
  AUTH0_URL,
  CLIENT_ID,
  CLIENT_SECRET,
  HASH_EXPIRES,
} from '../config';
import { ActivationTokenInfo, RefreshTokenInfo, User } from '../types';
import { debug, error } from '../libs/log';
import { errors } from '../messages';
import auth0api from '../libs/auth0-api';
import cache from '../libs/node-cache';
import createHash from '../libs/hash-maker';
import accessTokensCache from '../libs/access-tokens-cache';
import jwt from '../libs/jwt';
import refreshTokensCache from '../libs/refresh-tokens-cache';

const { INCORRECT_TOKEN, ERROR } = errors;

export async function getAuth0Token(): Promise<string | undefined> {
  if (cache.has('system_token')) {
    // if previous ttl did not expired - getting token from the cache.
    return cache.get('system_token');
  }
  const tokenBody = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    audience: `${AUTH0_URL}/api/v2/`,
    grant_type: 'client_credentials',
  };
  const [err, result] = await to(auth0api.post('/oauth/token', tokenBody));

  if (err) {
    error(err);
    throw ERROR;
  }

  cache.set(
    'system_token',
    (result as AxiosResponse<any>).data.access_token,
    Number(process.env.SYSTEM_TOKEN_TTL)
  );
  return (result as AxiosResponse<any>).data.access_token as string;
}

export async function findByActivationToken(
  email: string
): Promise<ActivationTokenInfo> {
  debug('Requesting token info by token from db');
  const [err, tokenInfo] = await to(dao.findByActivationToken(email));

  if (err) {
    error(err);
    throw ERROR;
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return tokenInfo!;
}

export async function makeActivationToken(data: User): Promise<string> {
  const expiresDate = new Date(Date.now() + HASH_EXPIRES);
  const { email, password } = data;
  const hash = createHash({ email, password });
  const [err, result] = await to(dao.addToken(data.email, hash, expiresDate));
  if (err) {
    error(err);
    throw ERROR;
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const token = result!.activation_token;
  return token;
}

export async function updateTokens(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const tokenIsValid = await jwt.check(refreshToken);
  if (tokenIsValid && refreshTokensCache.has(refreshToken)) {
    const existedTokenInfo = refreshTokensCache.get(
      refreshToken
    ) as RefreshTokenInfo;
    const newTokens = jwt.create({
      email: existedTokenInfo.email,
      role: existedTokenInfo.role,
    });
    refreshTokensCache.set(newTokens.refreshToken, {
      email: existedTokenInfo.email,
      accessToken: newTokens.accessToken,
      role: existedTokenInfo.role,
    });
    refreshTokensCache.del(refreshToken);
    accessTokensCache.del(existedTokenInfo.accessToken);
    accessTokensCache.set(
      newTokens.accessToken,
      existedTokenInfo.email,
      ACCESS_TOKEN_CACHE_TTL
    );
    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  }
  error(INCORRECT_TOKEN);
  throw Error(INCORRECT_TOKEN);
}
