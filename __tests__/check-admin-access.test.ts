import { to } from 'await-to-js';
import axios, { AxiosRequestConfig } from 'axios';
import app from '../src/app';
import accessTokensCache from '../src/libs/access-tokens-cache';
import jwt from '../src/libs/jwt';
import roles from '../src/libs/roles';

describe('Test check admin access', (): void => {
  const port = 8027;
  const path = `http://localhost:${port}/api/`;
  const testEmail = 'test1@test.com';

  beforeAll(async (): Promise<void> => {
    await app.start(port);
  });

  afterAll(async (): Promise<void> => {
    await app.stop();
  });

  it('should grant access for any user for get products', async (): Promise<void> => {
    const userHeaders = await createAccessHeadersForRole(testEmail, roles.user);
    const userResponse = await axios.get(path + 'products', userHeaders);
    expect(userResponse.status).toEqual(200);
    const adminHeaders = await createAccessHeadersForRole(testEmail, roles.userAndAdmin);
    const adminResponse = await axios.get(path + 'products', adminHeaders);
    expect(adminResponse.status).toEqual(200);
  });

  it('should restrict access for users for user role', async (): Promise<void> => {
    const userHeaders = await createAccessHeadersForRole(testEmail, roles.user);
    await axios.get(path + 'users', userHeaders)
    .catch((e) => expect(e.response.status).toBe(403));
  });

  it('should grant access for users for admin role', async (): Promise<void> => {
    const userHeaders = await createAccessHeadersForRole(testEmail, roles.userAndAdmin);
    const adminResponse = await axios.get(path + 'users', userHeaders)
    expect(adminResponse.status).toEqual(200);
  });
});

async function createAccessHeadersForRole(
  email: string,
  role: string
): Promise<AxiosRequestConfig<any> | undefined> {
  const tokens = await jwt.create({email, 'role': role});
  accessTokensCache.set(tokens.accessToken, email);
  const headers = {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  };
  return headers;
}
