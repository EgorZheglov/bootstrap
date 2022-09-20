import { to } from 'await-to-js';
import axios, { AxiosRequestConfig } from 'axios';
import { randomUUID } from 'crypto';

import app from '../../src/app';
import db from '../../src/db/db';
import accessTokensCache from '../../src/libs/access-tokens-cache';
import jwt from '../../src/libs/jwt';
import roles from '../../src/libs/roles';

describe('Test /categories endpoint', (): void => {
  const port = 8021;
  const path = `http://localhost:${port}/api/categories`;
  
  const mockData = [
    {
      "id": 4,
      "name": "Category Name",
      "slug": "ThisCategorySlug"
    }
  ];

  beforeAll(async (): Promise<void> => {
      await app.start(port);
  });

  afterAll(async (): Promise<void> => {
      await app.stop();
  }); 

  it('Test for method GET', async(): Promise<void> => {
      const headers = await createAccessHeaders("test1@test.com");
      const response = await axios.get(path, headers);
      expect(response.status).toEqual(200);
      expect(response.data).toEqual(mockData);
  });

  it('Should create a new category', async(): Promise<void> => {
    const headers = await createAccessHeaders("test1@test.com");
    const testName = randomUUID();
    const response = await axios.post(path, {
      'name': testName,
      'slug': testName
    }, headers);
    expect(response.status).toEqual(201);
    await to(db.query('delete from shop.categories where name = $1', [testName]));
  });

  it('should find category by ID', async(): Promise<void> => {
    const headers = await createAccessHeaders("test1@test.com");
    const response = await axios.get(path + '/1', headers);
        expect(response.status).toEqual(200);
        expect(response.data).toEqual(mockData);
  });

  it('Test for method PUT', async (): Promise<void> => {
    const headers = await createAccessHeaders("test1@test.com");
    const testName = randomUUID();
    await axios.post(path, {
      'name': testName,
      'slug': testName
    }, headers);
    const createdCategoryRes = await db.query('select id from shop.categories where name = $1', [testName]);
    const createdCategory = createdCategoryRes!.rows[0];
    const updatedTestName = randomUUID();
    const response = await axios.put(path + `/${createdCategory.id}`, {
      'name': updatedTestName,
      'slug': updatedTestName
    }, headers);
    expect(response.status).toEqual(200);
    await to(db.query('delete from shop.categories where name = $1', [updatedTestName]));
  });

  it('Test for method DELETE', async (): Promise<void> => {
      const headers = await createAccessHeaders("test1@test.com");
      const response = await axios.delete(path + '/1', headers);
      expect(response.status).toEqual(200);
  }); 
});

async function createAccessHeaders(email : string): Promise<AxiosRequestConfig<any> | undefined> {
  const tokens = await jwt.create({email, 'role': roles.userAndAdmin});
  accessTokensCache.set(tokens.accessToken, email);
  const headers = {
      headers: {
          'Authorization': `Bearer ${tokens.accessToken}`
      }
  };
  return headers;
}
