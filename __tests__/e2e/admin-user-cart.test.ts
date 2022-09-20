import axios, { AxiosRequestConfig } from 'axios';
import { randomUUID } from 'crypto';

import app from '../../src/app';
import accessTokensCache from '../../src/libs/access-tokens-cache';
import jwt from '../../src/libs/jwt';
import roles from '../../src/libs/roles';
import db from '../../src/db/db';
import userModel from '../../src/db/models/user';
import * as daoUser from '../../src/data-access/user.dao';
import * as daoCategory from '../../src/data-access/categories.dao';
import * as daoProducts from '../../src/data-access/products.dao';
import * as daoToken from '../../src/data-access/activation-token.dao';
import * as daoCart from '../../src/data-access/cart.dao';
import { makeActivationToken } from '../../src/controllers/tokens-controller';
import { error } from '../../src/libs/log';
import {
  Cart,
  Category,
  NewCategory,
  NewProduct,
  Product,
  User,
} from '../../src/types';

describe('e2e test: admin-category-product-user-cart', (): void => {
  const port = 8050;
  const basePath = `http://localhost:${port}`;
  const usersPath = `${basePath}/api/users`;
  const categoriesPath = `${basePath}/api/categories`;
  const productsPath = `${basePath}/api/products`;
  const cartPath = `${basePath}/api/me/cart`;
  const name = randomUUID().substring(16);
  const categoriesCount = 2;
  const productsCount = 5;
  const cartCount = 3;
  let admin: User, user: User, categories: Category[], products: Product[];

  beforeAll(async (): Promise<void> => {
    await app.start(port);

    const adminData = [
      `admin ${name}`,
      roles.userAndAdmin,
      true,
      `${name}@admin.com`,
      '123456',
    ];
    const adminResp = await db.query(userModel.createUser, adminData);
    admin = adminResp.rows[0] as User;
  });

  afterAll(async (): Promise<void> => {
    await daoUser.remove(admin.id);
    await app.stop();
  });

  it('Admin should create 2 categories with 5 products for each', async (): Promise<void> => {
    const headers = await createAccessHeaders(admin.email, roles.userAndAdmin);

    const categoriesData: NewCategory[] = [];
    for (let i = 0; i < categoriesCount; i++) {
      const name = randomUUID().substring(16);
      categoriesData.push({ name, slug: name });
    }
    const categoriesRespArray = categoriesData.map(async (category) => {
      const response = await axios.post(categoriesPath, category, headers);
      expect(response.status).toEqual(201);
      return response.data as Category;
    });
    await Promise.all(categoriesRespArray)
      .then((result) => (categories = result))
      .catch((e) => error(e));
    expect(categories.length).toEqual(categoriesCount);

    const productsData: any[] = []; // NewProduct
    categories.forEach((category) => {
      for (let i = 0; i < productsCount; i++) {
        const name = randomUUID().substring(16);
        const price = +(Math.random() * 1000).toFixed(2);
        productsData.push({
          authorId: admin.id,
          categoryId: category.id,
          name,
          slug: name,
          price,
          description: name,
          images: [],
          draft: false,
        });
      }
    });
    const productsRespArray = productsData.map(async (product) => {
      const response = await axios.post(productsPath, product, headers);
      expect(response.status).toEqual(201);
      return response.data as Product;
    });
    await Promise.all(productsRespArray)
      .then((result) => (products = result))
      .catch((e) => error(e));

    expect(products.length).toEqual(categoriesCount * productsCount);
  });

  it('Admin should create user', async () => {
    const headers = await createAccessHeaders(admin.email, roles.userAndAdmin);
    const userData = {
      name,
      email: `${name}@user.com`,
      password: '123456',
      confirm_password: '123456',
    };
    const userResp = await axios.post(usersPath, userData, headers);
    expect(userResp.status).toEqual(200);
    user = userResp.data as User;
  });

  it('Activate user', async () => {
    const token = await makeActivationToken(user);
    const responseFromActivation = await axios.get(
      `${basePath}/verify-email/${token}`
    );
    expect(responseFromActivation.status).toEqual(200);
    user.is_active = responseFromActivation.data as boolean;
  });

  it('User should fetch and put 3 products from every category 2 times into the cart', async () => {
    const headers = await createAccessHeaders(user.email, roles.user);
    const productsForCart: Product[] = [];
    categories.forEach((category) => {
      const filtered = products
        .filter((product) => product.category_id === category.id)
        .slice(0, cartCount);
      productsForCart.push(...filtered);
    });

    await Promise.all(
      productsForCart.map(async (product) => {
        const count = Math.trunc(Math.random() * 10);
        const cartData = { id: product.id, count };
        let response = await axios.post(cartPath, cartData, headers);
        let responseCart = response.data as Cart;
        expect(+responseCart.count).toEqual(count);
        expect(responseCart.product_id).toEqual(product.id);
        expect(responseCart.price).toEqual(product.price);
        expect(response.status).toEqual(200);

        response = await axios.post(cartPath, cartData, headers);
        responseCart = response.data as Cart;
        expect(+responseCart.count).toEqual(count * 2);
        expect(responseCart.product_id).toEqual(product.id);
        expect(response.status).toEqual(200);
      })
    )
      .then(async () => {
        const cartResponse = await axios.get(cartPath, headers);
        const userCarts = cartResponse.data as Cart[];
        const isSameOwner = userCarts.every(
          (cart) => cart.owner_id === user.id
        );
        expect(userCarts.length).toEqual(6);
        expect(isSameOwner).toEqual(true);
      })
      .catch((e) => error(e));
  });

  it('User sould remove his cart; admin should remove products, categories, user', async () => {
    let headers = await createAccessHeaders(user.email, roles.user);

    const cartResponse = await axios.delete(cartPath, headers);
    expect(cartResponse.status).toEqual(200);

    headers = await createAccessHeaders(admin.email, roles.userAndAdmin);
    await Promise.all(
      products.map(async (product) => {
        const response = await axios.delete(`${productsPath}/${product.id}`, headers);
        return response;
      })
    ).then(responses => {
        const areOkStatuses = responses.every((resp) => resp.status === 200);
        expect(areOkStatuses).toEqual(true);
    }).catch((e) => error(e));

    await Promise.all(
      categories.map(async (category) => {
        const response = await axios.delete(`${categoriesPath}/${category.id}`, headers);
        return response;
      })
    ).then(responses => {
        const areOkStatuses = responses.every((resp) => resp.status === 200);
        expect(areOkStatuses).toEqual(true);
    }).catch((e) => error(e));

    const userResponse = await axios.delete(`${usersPath}/${user.id}`, headers);
    expect(userResponse.status).toEqual(200);

    await daoToken.removeByEmail(user.email);
  });
});

async function createAccessHeaders(
  email: string,
  role: string
): Promise<AxiosRequestConfig<any> | undefined> {
  const tokens = jwt.create({ email, role });
  accessTokensCache.set(tokens.accessToken, email);
  const headers = {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  };
  return headers;
}
