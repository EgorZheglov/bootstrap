import axios from 'axios';
import app from '../../src/app';
import jwt from '../../src/libs/jwt';
import refreshTokensCache from '../../src/libs/refresh-tokens-cache';
import { User } from '../../src/types';
import * as userDao from '../../src/data-access/user.dao';
import { randomUUID } from 'crypto';

describe('Test /refresh-token endpoint', (): void => {
  const port = 8009;
  const path = `http://localhost:${port}/refreshtoken`;
  const testName = randomUUID().substring(26);
  const testUserData: User = {
    id: '',
    name: `${testName}`,
    role: 'user',
    is_active: true,
    email: `${testName}@email.com`,
    password: 'qwerty123',
    deleted_at: null
};

  beforeAll(async (): Promise<void> => {
    await app.start(port);
  });

  afterAll(async (): Promise<void> => {
    await app.stop();
  });

  it('Test for method POST with incorrect refreshtoken', async (): Promise<void> => {
    await axios
      .post(path, { refreshToken: 'wrongToken' })
      .catch((e) => expect(e.response.status).toBe(403));
  });

  it('Test for method POST with correct refreshtoken', async (): Promise<void> => {
    const tokens = await jwt.create({email: testUserData.email, 'role': testUserData.role});
    const newUser = await userDao.create(testUserData);
    if (!newUser) return;
    refreshTokensCache.set(tokens.refreshToken, {
      email: testUserData.email,
      accessToken: tokens.accessToken,
    });
    const newTokens = await axios.post(path, {
      refreshToken: tokens.refreshToken,
    });
    expect(newTokens).toBeDefined();
    await userDao.remove(newUser.id);
  });
});
