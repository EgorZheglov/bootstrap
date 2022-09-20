import axios, { AxiosResponse } from 'axios';
import nock from 'nock';
import { randomUUID } from 'crypto';

import accessTokensCache from '../../src/libs/access-tokens-cache';
import app from '../../src/app';
import db from '../../src/db/db';

describe('Test for NodeCache lib after server restarting', (): void => {
  const testName = randomUUID().substring(26); // short userName(10-length random value)
  const testUser = {
    name: `${testName}ncachetest`,
    email: `${testName}ncachetest@user.com`,
    password: '12345',
    confirm_password: '12345',
  };
  const port = 8045;
  const path = `http://localhost:${port}`;
  const headers = {
    headers: {
      Cookie: 'access_token=value;',
    },
  };

  beforeAll(async (): Promise<void> => {
    await app.start(port);
  });

  afterAll(async (): Promise<void> => {
    await db.query(`DELETE FROM shop.users WHERE email = $1`, [testUser.email]);
    await db.query(`DELETE FROM shop.auth_tokens WHERE email = $1`, [testUser.email]);
    await db.query(`DELETE FROM shop.activation_tokens WHERE email = $1`, [testUser.email]);
    await app.stop();
  });

  test('Signing up new acc and login, shutting down app and checking cache', async (): Promise<void> => {
    //signing up and login
    const auth0mock = nock(process.env.AUTH0_URL as string)
      .post('/oauth/token')
      .reply(200, {
        access_token: 'Hy6HhY',
        expires_in: 86400,
        token_type: 'Bearer',
      })
      .post('/api/v2/users')
      .reply(200, {
        created_at: '2021-11-25T14:40:34.187Z',
        email: testUser.email,
        email_verified: false,
        identities: [],
        name: 'testfore2e@user.com',
        nickname: 'testfore2e',
        picture:
          'https://s.gravatar.com/avatar/b59927fb9140134a3c547793991158cd?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fte.png',
        updated_at: '2021-11-25T14:40:34.187Z',
        user_id: 'auth0|619fa0628a4c39007207fbf8',
        username: testUser.name,
      });

    await axios.post(
      `${path}/signup`,
      {
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
        confirm_password: testUser.confirm_password,
      },
      headers
    );
    auth0mock.done();

    await axios.post(
      `${path}/login`,
      {
        email: testUser.email,
        password: testUser.password,
      },
      headers
    );
    //restarting our app
    await app.stop();
    await app.start(port);
    const responseFromLogin = axios.post(
      `${path}/login`,
      {
        email: testUser.email,
        password: testUser.password,
      },
      headers
    );
    //checking if NodeCache has Token after restarting
    const receivedToken: string = ((
      (await responseFromLogin) as AxiosResponse<any>
    ).data?.accessToken).toString();
    expect(accessTokensCache.get(receivedToken)).toBe(testUser.email);
  });
});
