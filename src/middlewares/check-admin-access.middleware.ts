import { Request, Response, NextFunction } from 'express';
import jwt from '../libs/jwt';

import { ERR, TokenInfo } from '../types';
import roles from '../libs/roles';

export default async (req: Request, res: Response, next: NextFunction) => {
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const authorizationHeader = req.headers.authorization!;
  if (!authorizationHeader) {
    return next(ERR.ACCESS_DENIED);
  }
  const tokenInfo = await jwt.check(authorizationHeader.split(' ')[1]);
  if ((tokenInfo as TokenInfo).role !== roles.userAndAdmin) {
    return next(ERR.ACCESS_DENIED);
  }
  return next();
};
