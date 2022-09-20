import { NextFunction, Request, Response, Router } from 'express';
import to from 'await-to-js';

import { ERR, TokenInfo } from '../../types';
import cart from '../cart';
import { messages } from '../../messages';
import { error } from '../../libs/log';
import {
  findByEmail,
  softDelete,
  update,
} from '../../controllers/user-controller';
import { meUpdateMw } from '../../middlewares/user.middleware';

import jwt from '../../libs/jwt';

const router = Router();
const { USER_DELETED, USER_UPDATED } = messages;

router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const authorizationHeader = req.headers.authorization!;
  const tokenInfo = await jwt.check(authorizationHeader.split(' ')[1]);
  const [err, response] = await to(
    findByEmail((tokenInfo as TokenInfo).email, (tokenInfo as TokenInfo).role)
  );

  if (err) {
    error(err);
    return next(ERR.ERROR_DURING_EXECUTING);
  }

  return res.status(200).send(response);
});

router.put(
  '/me',
  meUpdateMw,
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
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
  '/me',
  async (req: Request, res: Response, next: NextFunction) => {
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const authorizationHeader = req.headers.authorization!;
    const tokenInfo = await jwt.check(authorizationHeader.split(' ')[1]);
    const [err] = await to(softDelete((tokenInfo as TokenInfo).email));
    if (err) {
      error(err);
      return next(ERR.ERROR_DURING_EXECUTING);
    }
    return res.status(200).send(USER_DELETED);
  }
);

router.use('/me', cart);

export default router;
