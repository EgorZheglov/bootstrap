import { randomUUID } from 'crypto';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { User } from '../src/types'
import app from '../src/app';
import accessTokensCache from '../src/libs/access-tokens-cache';
import jwt from '../src/libs/jwt';
import roles from '../src/libs/roles';
import db from '../src/db/db';
import user from '../src/db/models/user';

import * as userDao from '../src/data-access/user.dao'

describe('Test check responses for user and admin', (): void => {
  const port = 8030;
  const path = `http://localhost:${port}/api/me`;
  const testEmail = 'test1';
  const name = randomUUID().substring(26);

  const testdefaultUser = {
    name: `${name}`,
    email: `${name}@email.com`,
    password: '12345',
    role: roles.user,
  };

  const testAdmin = {
    name: `${name}admin`,
    email: `${name}@admin.com`,
    password: '12345',
    role: roles.userAndAdmin,
  };
  

  beforeAll(async (): Promise<void> => {
    await app.start(port);
    await userDao.create(testdefaultUser) as User;
    await db.query(user.createUser, [testAdmin.name, testAdmin.role, true, testAdmin.email, testAdmin.password]);
  });

  afterAll(async (): Promise<void> => {
    await db.query(`DELETE FROM shop.users WHERE email = $1`, [testdefaultUser.email]);
    await db.query(`DELETE FROM shop.users WHERE email = $1`, [testAdmin.email]);
    await app.stop();
  });

  it('User should not recieve fields "role" and "is_active"', async (): Promise<void> => {

    const userHeaders = await createAccessHeadersForRole(testdefaultUser.email, testdefaultUser.role);
    const userResponse = await axios.get(path, userHeaders);
    expect((userResponse as AxiosResponse<any>).data.role).toBeUndefined();
    expect((userResponse as AxiosResponse<any>).data.is_active).toBeUndefined();

    const adminHeaders = await createAccessHeadersForRole(testAdmin.email, testAdmin.role);
    const adminResponse = await axios.get(path, adminHeaders);
    expect((adminResponse as AxiosResponse<any>).data.role).toEqual(roles.userAndAdmin);
    expect((adminResponse as AxiosResponse<any>).data.is_active).toEqual(true);
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