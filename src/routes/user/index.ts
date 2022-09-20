import { NextFunction, Request, Response, Router } from 'express';
import to from 'await-to-js';

import { ERR, TokenInfo } from '../../types';
import { messages } from '../../messages';
import { error } from '../../libs/log';
import { findById, remove, update } from '../../controllers/user-controller';
import {
  userDeleteMw,
  userFindByIdMw,
  userUpdateMw,
} from '../../middlewares/user.middleware';
import sanitizeRequests from '../../middlewares/sanitize-requests.middleware';
import adminOnly from '../../middlewares/check-admin-access.middleware';
import jwt from '../../libs/jwt';

const router = Router();
const { USER_DELETED, USER_UPDATED } = messages;

router.get(
  '/users/:userId',
  sanitizeRequests,
  adminOnly,
  userFindByIdMw,
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.userId;
    const [err, response] = await to(findById(id));
    if (err) {
      error(err);
      return next(ERR.ERROR_DURING_EXECUTING);
    }

    return res.status(200).send(response);
  }
);

router.put(
  '/users/:userId',
  sanitizeRequests,
  adminOnly,
  userUpdateMw,
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    /* eslint-disable-next-line  @typescript-eslint/no-non-null-assertion */
    const token = req.headers.authorization!;
    const tokenInfo = (await jwt.check(token.split(' ')[1])) as TokenInfo;
    const [err] = await to(update(tokenInfo, data));
    if (err) {
      error(err);
      return next(ERR.ERROR_DURING_EXECUTING);
    }

    return res.status(200).send(USER_UPDATED);
  }
);

router.delete(
  '/users/:userId',
  sanitizeRequests,
  adminOnly,
  userDeleteMw,
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.userId;
    const [err] = await to(remove(id));
    if (err) {
      error(err);
      return next(ERR.ERROR_DURING_EXECUTING);
    }

    return res.status(200).send(USER_DELETED);
  }
);

export default router;
