import { NextFunction, Request, Response, Router } from 'express';
import to from 'await-to-js';

import { ERR } from '../types';
import { logout } from '../services/auth.service';
import { error } from '../libs/log';

const router = Router();

router.get(
  '/logout',
  async (req: Request, res: Response, next: NextFunction) => {
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader) {
      const headerParts = authorizationHeader.split(' ');
      const [err, data] = await to(logout(headerParts[1]));
      if (err) {
        error(err);
        return next(ERR.ERROR_LOGOUT);
      }
      return res.status(200).send(data);
    }
    return next(ERR.SHOULD_CONTAINS_TOKEN);
  }
);

export default router;
