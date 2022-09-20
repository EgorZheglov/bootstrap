import to from 'await-to-js';

import jwt from '../libs/jwt';
import { errors } from '../messages';
import { error } from '../libs/log';
import accessTokensCache from '../libs/access-tokens-cache';
import { getAllTokens } from '../data-access/auth-token.dao';
import { authDbTokens } from '../types';

const { ERROR_GETTING_AUTH_DB_TOKENS } = errors;

export default {
  syncDbAuthTokens: async (): Promise<void> => {
    const [authDbTokensErr, authDbTokensRes] = await to(getAllTokens());
    authDbTokensRes?.forEach(async (item: authDbTokens) => {
      const checkToken = await jwt.check(item.token.accessToken);
      if (checkToken) {
        accessTokensCache.set(item.token.accessToken, item.email);
      }
    });
    if (authDbTokensErr) {
      error(authDbTokensErr);
      throw ERROR_GETTING_AUTH_DB_TOKENS;
    }
  },
};
