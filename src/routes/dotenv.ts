import { Request, Response, Router, NextFunction } from 'express';

import { CLIENT_ID, CLIENT_SECRET } from '../config';
import expressErrHandler from '../libs/express-err-handler';

const router = Router();

router.get(
  '/',
  expressErrHandler((req: Request, res: Response, next: NextFunction): void => {
    res.send({
      id: CLIENT_ID,
      secret: CLIENT_SECRET,
    });
  })
);

export default router;
