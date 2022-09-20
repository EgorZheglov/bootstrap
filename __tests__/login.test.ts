import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import tk from 'timekeeper';

import app from '../src/app';
import blacklist from '../src/libs/blacklist';
import { errors } from '../src/messages';
import jwt from '../src/libs/jwt';
import accessTokensCache from '../src/libs/access-tokens-cache';
import roles from '../src/libs/roles';

const { ERROR_LOGIN } = errors;

describe('Test /login endpoint', (): void => {
  const port = 8000;
  const path = `http://localhost:${port}/login`;

  beforeAll(async (): Promise<void> => {
    await app.start(port);
  });

  afterAll(async (): Promise<void> => {
    tk.reset();
    await app.stop();
  });

  it('Test for method POST without signup', async (): Promise<void> => {
    const headers = await createAccessHeaders('test1@test.com');
    await axios
      .post(
        path,
        {
          email: 'test@user.com',
          password: 12345,
        },
        headers
      )
      .catch((e) =>
        expect((e.response as AxiosResponse<any>).data).toEqual(ERROR_LOGIN)
      );
  });

  it('Test blacklist & rate limit', async (): Promise<void> => {
    const headers = await createAccessHeaders('test1@test.com');
    for (let i = 0; i < 9; i++) {
      try {
        await axios.post(path, {
          email: 'test@user.com',
          password: 12345,
        }, headers);
      } catch (e: any) {
        expect((e.response as AxiosResponse<any>).data).toEqual(ERROR_LOGIN);
      }
    }
    await axios
      .post(path, {
        email: 'test@user.com',
        password: 12345,
      }, headers)
      .catch(() => expect(blacklist.has('127.0.0.1')).toEqual(true));
  });

  it('Test removing user from blacklist', async (): Promise<void> => {
    tk.travel(Number(blacklist.getTtl('127.0.0.1')) + 1);
    expect(blacklist.has('127.0.0.1')).toEqual(false);
  });
});

async function createAccessHeaders(
  email: string
): Promise<AxiosRequestConfig<any> | undefined> {
  const tokens = await jwt.create({ email, role: roles.userAndAdmin });
  accessTokensCache.set(tokens.accessToken, email);
  const headers = {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  };
  return headers;
}
