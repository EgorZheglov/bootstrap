import axios, { AxiosRequestConfig } from 'axios';
import { randomUUID } from 'crypto';

import app from '../../src/app';
import db from '../../src/db/db';
import * as daoCategory from '../../src/data-access/categories.dao';
import * as daoUser from '../../src/data-access/user.dao';
import queryProduct from '../../src/db/models/products';
import accessTokensCache from '../../src/libs/access-tokens-cache';
import jwt from '../../src/libs/jwt';
import roles from '../../src/libs/roles';
import { ID, Product } from '../../src/types';

describe('Test /products endpoint', (): void => {
  const port = 8006;
  const path = `http://localhost:${port}/api/products`;
  const testName = randomUUID();
  const date = '2021-01-01';
  let product: Product, userId: ID, categoryId: ID;

  beforeAll(async (): Promise<void> => {
    await app.start(port);
    const resUser = await daoUser.create({
      name: testName,
      email: `${testName}@email.com`,
      password: '123456',
    });
    userId = resUser!.id;

    const resCategory = await daoCategory.create({ name: testName, slug: testName });
    categoryId = resCategory!.id;

    const resProduct = await db.query(queryProduct.create, [
      userId,
      categoryId,
      'experimentalProduct',
      `${testName}-slug`,
      date,
      3000,
      620000,
      'Initial description',
      [''],
      true
    ]);
    product = resProduct.rows[0] as Product;
  });

  afterAll(async (): Promise<void> => {
    await db.query(
      'delete from shop.products where author_id = (select id from shop.users where email = $1)',
      [`${testName}@email.com`]);
    await db.query('delete from shop.categories where name = $1', [testName]);
    await db.query('delete from shop.users where email = $1', [`${testName}@email.com`,]);
    await app.stop();
  });

  it('Test for method GET. It should return list of products', async (): Promise<void> => {
    let i = 3;
    while (i >= 0) {
      await db.query(queryProduct.create, [
        userId,
        categoryId,
        testName + i,
        testName,
        date,
        i,
        i,
        testName,
        [],
        false
      ]);
      i -= 1;
    }
    const res = await db.query(`select * from shop.products where "name" = '${testName}0'`);
    const expectedResult = res!.rows;
    const query = `?page=1&perPage=1&category=${testName}&orderBy=price&order=asc`;
    const headers = await createAccessHeaders('test1@test.com');
    const response = await axios.get(path + query, headers);
    expect(response.status).toEqual(200);
    // TODO: deal with datatypes
    expect(JSON.stringify(response.data)).toStrictEqual(JSON.stringify(expectedResult));
  });

  it('Should get a product by ID', async (): Promise<void> => {
    const headers = await createAccessHeaders('test1@test.com');
    const response = await axios.get(`${path}/${product.id}`, headers);
    product.number_of_views!++;

    expect(response.status).toEqual(200);
    expect(JSON.stringify(response.data)).toStrictEqual(JSON.stringify((product)));
  });

  it('Should update all the data in a product', async (): Promise<void> => {
    const headers = await createAccessHeaders('test1@test.com');
    const bodyToUpdate = {
      id: product.id,
      name: 'Updated product name',
      slug: 'updated-product-name',
      price: 111111,
      description: 'updated-description',
      images: [],
      draft: false,
    };
    const response = await axios.put(`${path}/${product.id}`, bodyToUpdate, headers);

    expect(response.status).toEqual(200);
    expect(response.data).toBe('Product updated');

    const resUpdatedProduct = await db.query('select * from shop.products where id = $1', [product.id]);
    product.number_of_views!++;
    product = { ...product, ...bodyToUpdate };

    const result = resUpdatedProduct!.rows[0];
    expect(result.name).toBe(product.name);
    expect(result.slug).toBe(product.slug);
    //TODO: result.price (decimal) needs to be fixed; it should be parced initially.
    expect(parseFloat(result.price)).toBe(product.price);
    expect(result.description).toBe(product.description);
    expect(result.images).toStrictEqual(product.images);
    expect(result.draft).toBe(product.draft);
  });

  it('Should update slug, price, description, images and draft in a product', async (): Promise<void> => {
    const headers = await createAccessHeaders('test1@test.com');
    const bodyToUpdate = {
      id: product.id,
      slug: 'updated-product-name-2',
      price: 222222,
      description: 'updated-description-2',
      images: [],
      draft: true,
    };
    const response = await axios.put(`${path}/${product.id}`, bodyToUpdate, headers);

    expect(response.status).toEqual(200);
    expect(response.data).toBe('Product updated');

    const resUpdatedProduct = await db.query('select * from shop.products where id = $1', [product.id]);
    product.number_of_views!++;
    product = { ...product, ...bodyToUpdate };

    const result = resUpdatedProduct!.rows[0];
    expect(result.slug).toBe(product.slug);
    //TODO: result.price (decimal) needs to be fixed; it should be parced initially.
    expect(parseFloat(result.price)).toBe(product.price);
    expect(result.description).toBe(product.description);
    expect(result.images).toStrictEqual(product.images);
    expect(result.draft).toBe(product.draft);
  });

  it('Should update price, description, images and draft in a product', async (): Promise<void> => {
    const headers = await createAccessHeaders('test1@test.com');
    const bodyToUpdate = {
      id: product.id,
      price: 333333,
      description: 'updated-description-3',
      images: [],
      draft: false,
    };
    const response = await axios.put(`${path}/${product.id}`, bodyToUpdate, headers);

    expect(response.status).toEqual(200);
    expect(response.data).toBe('Product updated');

    const resUpdatedProduct = await db.query('select * from shop.products where id = $1', [product.id]);
    product.number_of_views!++;
    product = { ...product, ...bodyToUpdate };

    const result = resUpdatedProduct!.rows[0];
    //TODO: result.price (decimal) needs to be fixed; it should be parced initially.
    expect(parseFloat(result.price)).toBe(product.price);
    expect(result.description).toBe(product.description);
    expect(result.images).toStrictEqual(product.images);
    expect(result.draft).toBe(product.draft);
  });

  it('Should update description, images and draft in a product', async (): Promise<void> => {
    const headers = await createAccessHeaders('test1@test.com');
    const bodyToUpdate = {
      id: product.id,
      description: 'updated-description-4',
      images: [],
      draft: true,
    };
    const response = await axios.put(`${path}/${product.id}`, bodyToUpdate, headers);

    expect(response.status).toEqual(200);
    expect(response.data).toBe('Product updated');

    const resUpdatedProduct = await db.query('select * from shop.products where id = $1', [product.id]);
    product.number_of_views!++;
    product = { ...product, ...bodyToUpdate };

    const result = resUpdatedProduct!.rows[0];
    expect(result.description).toBe(product.description);
    expect(result.images).toStrictEqual(product.images);
    expect(result.draft).toBe(product.draft);
  });

  it('Should update images and draft in a product', async (): Promise<void> => {
    const headers = await createAccessHeaders('test1@test.com');
    const bodyToUpdate = {
      id: product.id,
      images: [],
      draft: false,
    };
    const response = await axios.put(`${path}/${product.id}`, bodyToUpdate, headers);

    expect(response.status).toEqual(200);
    expect(response.data).toBe('Product updated');

    const resUpdatedProduct = await db.query('select * from shop.products where id = $1', [product.id]);
    product.number_of_views!++;
    product = { ...product, ...bodyToUpdate };

    const result = resUpdatedProduct!.rows[0];
    expect(result.images).toStrictEqual(product.images);
    expect(result.draft).toBe(product.draft);
  });

  it('Should update just draft in a product', async (): Promise<void> => {
    const headers = await createAccessHeaders('test1@test.com');
    const bodyToUpdate = {
      id: product.id,
      draft: true,
    };
    const response = await axios.put(`${path}/${product.id}`, bodyToUpdate, headers);

    expect(response.status).toEqual(200);
    expect(response.data).toBe('Product updated');

    const resUpdatedProduct = await db.query('select * from shop.products where id = $1', [product.id]);
    product.number_of_views!++;
    product = { ...product, ...bodyToUpdate };

    const result = resUpdatedProduct!.rows[0];
    expect(result.name).toBe('Updated product name');
    expect(result.slug).toBe('updated-product-name-2');
    //TODO: result.price (decimal) needs to be fixed; it should be parced initially.
    expect(parseFloat(result.price)).toBe(333333);
    expect(result.description).toBe('updated-description-4');
    expect(result.images).toStrictEqual([]);
    expect(result.draft).toEqual(true);
  });

  it('Should delete a product', async (): Promise<void> => {
    const headers = await createAccessHeaders('test1@test.com');
    const response = await axios.delete(`${path}/${product.id}`, headers);
    expect(response.status).toEqual(200);
    expect(response.data).toBe('Product deleted');

    const resDeletedProduct = await db.query('select * from shop.products where id = $1', [product.id]);
    expect(resDeletedProduct!.rows[0]).toBe(undefined);
  });
});

async function createAccessHeaders(
  email: string
): Promise<AxiosRequestConfig<any> | undefined> {
  const tokens = await jwt.create({ email, 'role': roles.user });
  accessTokensCache.set(tokens.accessToken, email);
  const headers = {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  };
  return headers;
}