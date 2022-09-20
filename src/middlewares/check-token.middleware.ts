import { NextFunction, Request, Response } from 'express';

import { ERR } from '../types';
import jwt from '../libs/jwt';
import accessTokensCache from '../libs/access-tokens-cache';

const checkToken = async (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return next(ERR.SHOULD_CONTAINS_TOKEN);
  }
  const headerParts = authorizationHeader.split(' ');
  if (headerParts[0] !== 'Bearer') {
    return next(ERR.INCORRECT_TOKEN);
  }
  const accessToken = headerParts[1];
  const tokenIsValid = await jwt.check(accessToken);
  if (!tokenIsValid || !accessTokensCache.has(accessToken)) {
    return next(ERR.INCORRECT_TOKEN);
  }
  return next();
};

export default checkToken;
