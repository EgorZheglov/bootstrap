import { NextFunction, Request, Response, Router } from 'express';
import to from 'await-to-js';

import { updateTokens } from '../controllers/tokens-controller';
import { ERR } from '../types';

const refreshRoute = Router();

refreshRoute.post(
  '/refreshtoken',
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(ERR.BAD_REQUEST);
    }
    const [refreshTokenError, refreshResult] = await to(
      updateTokens(refreshToken)
    );
    if (refreshTokenError) {
      return next(ERR.INCORRECT_TOKEN);
    }
    return res.status(200).send(refreshResult);
  }
);

export default refreshRoute;
