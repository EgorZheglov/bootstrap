import { NextFunction, Request, Response } from 'express';

import { ERR } from '../types';
import cache from '../libs/node-cache';
import blacklist from '../libs/blacklist';
import ipTransform from '../libs/ip-transform';

export default (req: Request, res: Response, next: NextFunction) => {
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const ip = ipTransform(req.socket.remoteAddress!);

  if (blacklist.has(ip)) {
    return next(ERR.MOVED_TEMPORARILY);
  }

  if (cache.has(ip)) {
    // if we had unsuccesfull request from this host in the last minute - cache will register it
    if (Number(cache.get(ip)) < 10) {
      cache.set(ip, Number(cache.get(ip)) + 1, 60);

      return next();
    }
    blacklist.set(ip, null, Number(process.env.BLACKLIST_TTL));

    return next(ERR.MOVED_TEMPORARILY);
  }
  cache.set(ip, 1, 60);

  return next();
};
