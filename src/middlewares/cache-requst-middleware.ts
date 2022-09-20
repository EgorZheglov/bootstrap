import { NextFunction, Request, Response } from 'express';

import requestCache from '../libs/request-cache';
import { CachingRequestData } from '../types';

export default (req: Request, res: Response, next: NextFunction) => {
  requestCache.setRequest(req as CachingRequestData);
  next();
};
