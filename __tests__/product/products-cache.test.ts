import { to } from 'await-to-js';
import axios, { AxiosRequestConfig } from 'axios';
import { randomUUID } from 'crypto';
import tk from 'timekeeper';

import roles from '../../src/libs/roles';
import { PRODUCTS_FILTER_CACHE_TTL } from '../../src/config';
import app from '../../src/app';
import db from '../../src/db/db';
import * as daoUser from '../../src/data-access/user.dao';
import * as productsDao from '../../src/data-access/products.dao';
import accessTokensCache from '../../src/libs/access-tokens-cache';
import jwt from '../../src/libs/jwt';

describe('Testing caching request with filters', (): void => {
  const port = 8015;
  const path = `http://localhost:${port}/api/products`;
  const testName = randomUUID();

  beforeAll(async (): Promise<void> => {
    await app.start(port);
    await to(daoUser.create({'name': testName, 'email': `${testName}@email.com`, 'password': '123456' }));
  });

  afterAll(async (): Promise<void> => {
    await to(db.query('delete from shop.users where email = $1', [`${testName}@email.com`]));  
    tk.reset();
    await app.stop();
  });

  it('Test caching requests', async(): Promise<void> => {     
    const headers = await createAccessHeaders(`${testName}@email.com`);
    const date = '2021-03-20';
    const query = `?maxCreatedAt=${date}`; 
        
    jest.spyOn(productsDao, 'findDefaultSearch');
    await axios.get(path + query, headers);
    await axios.get(path + query, headers);
    await axios.get(path + query, headers);
    expect(productsDao.findDefaultSearch).toBeCalledTimes(1);

    //cache for find controller will crear then we go again to db
    tk.travel(new Date().getTime() + PRODUCTS_FILTER_CACHE_TTL);
    await axios.get(path + query, headers);
    await axios.get(path + query, headers);
    await axios.get(path + query, headers);
    expect(productsDao.findDefaultSearch).toBeCalledTimes(2);
  });
});

async function createAccessHeaders(email : string): Promise<AxiosRequestConfig<any> | undefined> {
    const tokens = await jwt.create({ email: email, role: roles.user});
    accessTokensCache.set(tokens.accessToken, email);
    const headers = {
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`
      }
    };
    return headers;
  }