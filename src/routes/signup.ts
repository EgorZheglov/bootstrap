import { NextFunction, Request, Response, Router } from 'express';
import to from 'await-to-js';

import { ERR } from '../types';
import { signup } from '../services/auth.service';
import { error } from '../libs/log';
import roles from '../libs/roles';
import sanitizeRequests from '../middlewares/sanitize-requests.middleware';

const router = Router();
const { user } = roles;

router.post(
  '/signup',
  sanitizeRequests,
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirm_password: req.body.confirm_password,
      role: user,
    };
    const [err, response] = await to(signup(payload));
    if (err) {
      error(err);
      return next(ERR.ERROR_SIGNUP);
    }

    return res.status(200).send(response);
  }
);

export default router;
