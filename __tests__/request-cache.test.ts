import axios, { AxiosResponse } from 'axios';

import app from '../src/app';
import requestCache, { CachedRequest } from '../src/libs/request-cache';
import { errors } from '../src/messages';

const { ERROR_LOGIN, USER_NOT_FOUND } = errors;

describe('Test /login endpoint', (): void => {
  const port = 8025;
  const path = `http://localhost:${port}/login`;

  beforeAll(async (): Promise<void> => {
    await app.start(port);
  });

  afterAll(async (): Promise<void> => {
    await app.stop();
  });

  it('Test for method POST without signup', async (): Promise<void> => {
    let reqId;

    expect(requestCache.requestCacheObject.keys().length).toEqual(0);
    await axios
      .post(path, {
        email: 'testsByEgorEncorporated@user.com',
        password: 12345,
      })
      .catch((e) =>
        expect((e.response as AxiosResponse<any>).data).toEqual(ERROR_LOGIN)
      );
    expect(requestCache.requestCacheObject.keys().length).toEqual(1);

    reqId = requestCache.requestCacheObject.keys()[0];
    expect(
      (requestCache.requestCacheObject.get(reqId) as CachedRequest).response
    ).toEqual(USER_NOT_FOUND);
  });
});
