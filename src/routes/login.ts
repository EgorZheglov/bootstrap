import to from 'await-to-js';
import { NextFunction, Request, Response, Router } from 'express';

import { ERR } from '../types';
import customRateLimiter from '../middlewares/custom-rate-limiter.middleware';
import sanitizeRequests from '../middlewares/sanitize-requests.middleware';
import { login } from '../services/auth.service';
import { messages } from '../messages';
import requestCache from '../libs/request-cache';
import { ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } from '../config';

const router = Router();
const { USER_SIGNED_IN } = messages;

router.post(
  '/login',
  sanitizeRequests,
  customRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = {
      email: req.body.email,
      password: req.body.password,
      requestId: req.id,
      /* eslint-disable-next-line  @typescript-eslint/no-non-null-assertion */
      ip: req.socket.remoteAddress!,
    };
    const [err, data] = await to(login(loginInfo));
    if (err || !data) {
      /* eslint-disable-next-line  @typescript-eslint/no-non-null-assertion */
      requestCache.setResponse(loginInfo.requestId, err!);
      return next(ERR.ERROR_LOGIN);
    }

    const response = {
      message: USER_SIGNED_IN,
      accessToken: data.accessToken,
      accessTokenTimeout: ACCESS_TOKEN_EXPIRES,
      refreshToken: data.refreshToken,
      refreshTokenTimeout: REFRESH_TOKEN_EXPIRES,
    };

    requestCache.setResponse(loginInfo.requestId, response);
    return res.status(200).json(response);
  }
);

export default router;
