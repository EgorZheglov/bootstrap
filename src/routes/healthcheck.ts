import { Response, Request, Router } from 'express';
import to from 'await-to-js';

import db from '../db/db';

const router = Router();

router.get(
  '/healthcheck',
  async (req: Request, res: Response): Promise<void> => {
    const [err, dbStatus] = await to(db.query('SELECT 1'));
    const info = {
      timestamp: Date.now(),
      uptime: process.uptime(),
      version: 'v1',
      database: !err && dbStatus ? 'connected' : 'disconnected',
    };
    res.status(200).send(info);
  }
);

export default router;
