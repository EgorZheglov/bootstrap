import NodeCache from 'node-cache';

import { CachingRequestData } from '../types';

export type CachedRequest = {
  request: Array<object | string>;
  response: object | Error | string;
};

const requestCacheObject = new NodeCache({
  stdTTL: Number(process.env.REQUEST_CACHE_TTL),
});

const setRequest = (req: CachingRequestData) => {
  if (Object.keys(req.params).length !== 0) {
    requestCacheObject.set(req.id, {
      request: [req.method, req.params, req.body],
      response: 'Not processed',
    });
  } else {
    requestCacheObject.set(req.id, {
      request: [req.method, req.body],
      response: 'Not processed',
    });
  }
};

const setResponse = (reqId: string, responseData: object | string) => {
  const request = requestCacheObject.take(reqId) as CachedRequest;
  request.response = responseData;
  return requestCacheObject.set(reqId, request);
};

export default { requestCacheObject, setRequest, setResponse };
