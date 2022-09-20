import { NextFunction, Request, Response, Router } from 'express';
import to from 'await-to-js';

import { error } from '../libs/log';
import { verifyEmail } from '../services/auth.service';
import { ERR } from '../types';

const router = Router();

router.get(
  '/verify-email/:token?',
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const [err, data] = await to(verifyEmail(token));
    if (err) {
      error(err);
      return next(ERR.ERROR_VERIFICATION_EMAIL);
    }
    return res.status(200).send(data);
  }
);

export default router;
