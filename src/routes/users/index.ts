import { NextFunction, Request, Response, Router } from 'express';
import to from 'await-to-js';
import { body } from 'express-validator';

import { ERR } from '../../types';
import { create, find } from '../../controllers/user-controller';
import { userRegisterMw } from '../../middlewares/user.middleware';
import { error } from '../../libs/log';
import adminOnly from '../../middlewares/check-admin-access.middleware';

const router = Router();

router.get(
  '/users',
  adminOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    const [err, response] = await to(find());
    if (err) {
      error(err);
      return next(ERR.ERROR_DURING_EXECUTING);
    }
    return res.status(200).send(response);
  }
);

router.post(
  '/users',
  body('email').not().isEmpty().trim().isEmail().normalizeEmail(),
  body('name').not().isEmpty().trim().escape(),
  adminOnly,
  userRegisterMw,
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    const data = { name, email, password };
    const [err, response] = await to(create(data));
    if (err) {
      error(err);
      return next(ERR.ERROR_DURING_EXECUTING);
    }
    return res.status(200).send(response);
  }
);
export default router;
