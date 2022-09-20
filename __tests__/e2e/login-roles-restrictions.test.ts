import { to } from 'await-to-js';
import { randomUUID } from 'crypto';
import axios, { AxiosResponse } from 'axios';

import app from '../../src/app';
import db from '../../src/db/db';
import accessTokensCache from '../../src/libs/access-tokens-cache';
import refreshTokensCache from '../../src/libs/refresh-tokens-cache';
import role from '../../src/libs/roles';

describe('e2e login + roles restrictions check via /categories & /users', (): void => {
  const port = 8011;
  const path = `http://localhost:${port}`;
  const testName = randomUUID().substring(26);
  const testUser = {
    name: `${testName}user`,
    email: `${testName}user@email.com`,
    role: role.user,
    password: '123456',
  };
  const testAdmin = {
    name: `${testName}admin`,
    email: `${testName}admin@email.com`,
    role: role.userAndAdmin,
    password: '123456',
  };
  const headers = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  beforeAll(async (): Promise<void> => {
    await app.start(port);
    await to(
      db.query(
        'insert into shop.users (name, email, password, role) values ($1, $2, $3, $4)',
        [testUser.name, testUser.email, testUser.password, testUser.role]
      )
    );
    await to(
      db.query(
        'insert into shop.users (name, email, password, role) values ($1, $2, $3, $4)',
        [testAdmin.name, testAdmin.email, testAdmin.password, testAdmin.role]
      )
    );
  });

  afterAll(async (): Promise<void> => {
    await to(
      db.query('delete from shop.users where email = $1', [testUser.email])
    );
    await to(
      db.query('delete from shop.users where email = $1', [testAdmin.email])
    );
    await app.stop();
  });

  it('Shoud login USER, give access to get/categories, restrict to get/users ', async (): Promise<void> => {
    const login = await axios.post(`${path}/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    const accessToken = (login as AxiosResponse<any>).data.accessToken;
    const refreshToken = (login as AxiosResponse<any>).data.refreshToken;
    // check login
    expect(login.status).toEqual(200);
    expect(accessTokensCache.get(accessToken)).toBe(testUser.email);
    expect(refreshTokensCache.get(refreshToken)).toStrictEqual({
      email: testUser.email,
      accessToken: (login as AxiosResponse<any>).data.accessToken,
      role: testUser.role,
    });
    const authorizationHeaders = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    // check get access
    const getCategories = await axios.get(
      `${path}/api/categories`,
      authorizationHeaders
    );
    expect(getCategories.status).toEqual(200);
    // check get restriction
    await axios
      .get(`${path}/api/users`, authorizationHeaders)
      .catch((e) => expect(e.response.status).toBe(403));
  });

  it('Shoud login ADMIN, give access to get/categories and to get/users ', async (): Promise<void> => {
    const login = await axios.post(`${path}/login`, {
      email: testAdmin.email,
      password: testAdmin.password,
    });
    const accessToken = (login as AxiosResponse<any>).data.accessToken;
    const refreshToken = (login as AxiosResponse<any>).data.refreshToken;
    // check login
    expect(login.status).toEqual(200);
    expect(accessTokensCache.get(accessToken)).toBe(testAdmin.email);
    expect(refreshTokensCache.get(refreshToken)).toStrictEqual({
      email: testAdmin.email,
      accessToken: (login as AxiosResponse<any>).data.accessToken,
      role: testAdmin.role,
    });
    const authorizationHeaders = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    // check get access
    const getCategories = await axios.get(
      `${path}/api/categories`,
      authorizationHeaders
    );
    expect(getCategories.status).toEqual(200);
    const getUsers = await axios.get(`${path}/api/users`, authorizationHeaders);
    expect(getUsers.status).toEqual(200);
  });
});
