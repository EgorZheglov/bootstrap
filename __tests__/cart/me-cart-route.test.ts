import axios, { AxiosRequestConfig } from 'axios';
import { randomUUID } from 'crypto';

import app from '../../src/app';
import accessTokensCache from '../../src/libs/access-tokens-cache';
import jwt from '../../src/libs/jwt';
import roles from '../../src/libs/roles';
import db from '../../src/db/db'
import * as daoUser from '../../src/data-access/user.dao';
import * as daoCategory from '../../src/data-access/categories.dao';
import * as daoProducts from '../../src/data-access/products.dao';
import productModel from '../../src/db/models/products';
import { Cart, Category, Product, User } from '../../src/types';
import { messages } from '../../src/messages';
import { error } from '../../src/libs/log';

const { PRODUCT_DELETED, CART_DELETED } = messages;

describe('Test for /cart endpoint:', (): void => {
    const port = 8024;
    const path = `http://localhost:${port}/api/me/cart`;

    const name = randomUUID().substring(26);
    const secondName = randomUUID().substring(26);
    const testUsers = [
        {
            name,
            email: `${name}@cart.com`,
            password: '12345'
        },
        {
            name: `${secondName}`,
            email: `${secondName}@cart.com`,
            password: '12345'
        }
    ];
    const testProducts = [
        {
            name,
            slug: name,
            createdDate: new Date('2021-03-20'),
            viewsNumber: 14,
            price: 400,
            description: name,
            images: [],
            draft: true,
        },
        {
            name: `${secondName}`,
            slug: `${secondName}`,
            createdDate: new Date('2021-03-20'),
            viewsNumber: 144,
            price: 100,
            description: `${secondName}`,
            images: [],
            draft: true,
        }
    ];
    let category: Category, users: User[], products: Product[];

    beforeAll(async (): Promise<void> => {
        await app.start(port);

        const dbUsers = await testUsers.reduce(async (acc: any, user) => {
            const res: Array<any> = await acc;
            const newUser = await daoUser.create(user);
            if (!newUser) return;
            res.push(newUser);
            return res;
        }, Promise.resolve([]));
        users = dbUsers as User[];     
        category = await daoCategory.create({ name, slug: name }) as Category;
        const dbProducts = await testProducts.reduce(async (acc: any, prod) => {
            const res: Array<any> = await acc;
            const productParams = [
                users[0].id, category.id, prod.name, prod.slug, 
                prod.createdDate, prod.viewsNumber, 
                prod.price, prod.description, prod.images, prod.draft
            ];
            const createdProduct = await db.query(productModel.create, productParams);
            res.push(createdProduct.rows[0] as Product);
            return res;
        }, Promise.resolve([]));
        products = dbProducts as Product[];
    });

    afterAll(async (): Promise<void> => {
        await Promise.all(
            products.map(product => daoProducts.remove(product.id))
        ).then(async () => {
            await daoCategory.remove(category.id);
        }).catch(e => error(e));
        
        await Promise.all(
            users.map(user => daoUser.remove(user.id))
        ).catch(e => error(e));

        await app.stop();
    }); 

    it('should add, update and delete products to carts of different users', async (): Promise<void> => {
        // add first product to cart of first user
        let headers = await createAccessHeaders(users[0].email);
        let count = 4;
        let cartData = { id: products[0].id, count };
        let response = await axios.post(path, cartData, headers);
        let responseCart = response.data as Cart;
        expect(+responseCart.count).toEqual(count);
        expect(responseCart.owner_id).toEqual(users[0].id);
        expect(responseCart.product_id).toEqual(products[0].id);
        expect(responseCart.price).toEqual(products[0].price);
        expect(response.status).toEqual(200);

        // add first product to cart of second user
        headers = await createAccessHeaders(users[1].email);
        count = 2;
        cartData = { id: products[0].id, count };
        response = await axios.post(path, cartData, headers);
        responseCart = response.data as Cart;
        expect(+responseCart.count).toEqual(count);
        expect(responseCart.owner_id).toEqual(users[1].id);
        expect(responseCart.product_id).toEqual(products[0].id);
        expect(responseCart.price).toEqual(products[0].price);
        expect(response.status).toEqual(200);

        // add second product to cart of first user
        headers = await createAccessHeaders(users[0].email);
        count = 1;
        cartData = { id: products[1].id, count };
        response = await axios.post(path, cartData, headers);
        responseCart = response.data as Cart;
        expect(+responseCart.count).toEqual(count);
        expect(responseCart.owner_id).toEqual(users[0].id);
        expect(responseCart.product_id).toEqual(products[1].id);
        expect(responseCart.price).toEqual(products[1].price);
        expect(response.status).toEqual(200);

        // check cart of first user, expected two products
        response = await axios.get(path, headers);
        let cartProducts = response.data as Cart [];
        expect(cartProducts.length).toEqual(2);
        cartProducts.forEach(cart => {
            expect(cart.owner_id).toEqual(users[0].id);
        });        
        expect(response.status).toEqual(200);

        // check cart of second user, expected one product
        headers = await createAccessHeaders(users[1].email);
        response = await axios.get(path, headers);
        cartProducts = response.data as Cart [];
        expect(cartProducts.length).toEqual(1);
        cartProducts.forEach(cart => {
            expect(cart.owner_id).toEqual(users[1].id);
        });        
        expect(response.status).toEqual(200);

        // remove all products from cart of second user
        response = await axios.delete(path, headers);
        expect(response.data).toEqual(CART_DELETED);
        expect(response.status).toEqual(200);

        // check cart of second user, expected empty array
        response = await axios.get(path, headers);
        cartProducts = response.data as Cart [];
        expect(cartProducts.length).toEqual(0);
        expect(response.status).toEqual(200);

        // add 3 more items of the first product to the cart of first user, expected 7
        headers = await createAccessHeaders(users[0].email);
        count = 3;
        cartData = { id: products[0].id, count };
        response = await axios.post(path, cartData, headers);
        const expectedCount = 7;
        expect(+(response.data as Cart).count).toEqual(expectedCount);
        expect(response.status).toEqual(200);

        // remove 6 items of the first product from the cart of first user, expected 1
        count = 6;
        cartData = { ...cartData, count };
        response = await axios.put(path, cartData, headers);
        const expectedCount2 = 1;
        expect(+(response.data as Cart).count).toEqual(expectedCount2);
        expect(response.status).toEqual(200);

        // remove 6 more items of the first product from the cart of first user,
        // expected 'product deleted' message
        response = await axios.put(path, cartData, headers);
        expect(response.data).toEqual(PRODUCT_DELETED);
        expect(response.status).toEqual(200);

        // remove second product by id from the cart of first user
        response = await axios.delete(`${path}/${products[1].id}`, headers);
        expect(response.data).toEqual(PRODUCT_DELETED);
        expect(response.status).toEqual(200);

        // check cart of first user by email, expected empty array
        response = await axios.get(path, headers);
        cartProducts = response.data as Cart [];
        expect(cartProducts.length).toEqual(0);
        expect(response.status).toEqual(200);
    });
});

async function createAccessHeaders(email : string): Promise<AxiosRequestConfig<any> | undefined> {
    const tokens = jwt.create({email, role: roles.user});
    accessTokensCache.set(tokens.accessToken, email);
    const headers = {
        headers: {
            'Authorization': `Bearer ${tokens.accessToken}`
        }
    };
    return headers;
}
