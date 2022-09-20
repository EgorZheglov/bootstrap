import { randomUUID } from 'crypto';

import app from '../../src/app';
import db from '../../src/db/db';
import { 
  findAllCarts, 
  findCartByOwnerId 
} from '../../src/controllers/cart-controller';
import * as daoUser from '../../src/data-access/user.dao';
import * as daoCart from '../../src/data-access/cart.dao';
import * as daoProducts from '../../src/data-access/products.dao';
import * as daoCategory from '../../src/data-access/categories.dao';
import productModel from '../../src/db/models/products';
import { Category, Product, User } from '../../src/types';

describe('Test cart controller', (): void => {
  const port = 8026;
  const name = randomUUID().substring(26);
  const testUser = {
    name,
    email: `${name}@cart.com`,
    password: '12345',
  };
  const testProduct = {
      name,
      slug: name,
      created_date: '2021-03-20',
      number_of_views: 14,
      price: 400,
      description: name,
      images: [],
      draft: false
    };
  let user: User, category: Category, product: Product;

  beforeAll(async (): Promise<void> => {
    await app.start(port);
    user = await daoUser.create(testUser) as User;
    category = await daoCategory.create({ name, slug: name }) as Category;
    const productParams = [
      user.id, category.id, testProduct.name, testProduct.slug, 
      testProduct.created_date, testProduct.number_of_views, 
      testProduct.price, testProduct.description, testProduct.images, testProduct.draft
    ];
    const createdProduct = await db.query(productModel.create, productParams);
    product = createdProduct.rows[0] as Product;
    const params = [ name, user.id, product.id ];
    await db.query('insert into shop.cart (name, owner_id, product_id) values($1, $2, $3)', params);
  });

  afterAll(async (): Promise<void> => {
    await daoCart.removeCart(user.email);
    await daoProducts.remove(product.id)
    await daoCategory.remove(category.id);
    await daoUser.remove(user.id);
    await app.stop();
  });

  it('Test findAllCarts method', async (): Promise<void> => {    
    const carts = await findAllCarts();
    const cartsForTest = carts.filter(cart => cart.name === name);
    expect(cartsForTest.length).toEqual(1);
    expect(cartsForTest[0].name).toEqual(name);
    expect(cartsForTest[0].owner_id).toEqual(user.id);
  });

  it('Test findCartByOwnerId method', async (): Promise<void> => {
    const carts = await findCartByOwnerId(user.id);
    expect(carts[0].name).toEqual(name);
    expect(carts[0].owner_id).toEqual(user.id);
  });
});
