import { randomUUID } from 'crypto';

import app from '../../src/app';
import db from '../../src/db/db'
import * as daoUser from '../../src/data-access/user.dao';
import * as daoCategory from '../../src/data-access/categories.dao';
import * as daoProducts from '../../src/data-access/products.dao';
import productModel from '../../src/db/models/products';
import { Category, Product, User } from '../../src/types';

describe('Test for products incrementing methods:', (): void => {
    const port = 8030;

    const name = randomUUID().substring(26);
    let viewsNumber = 0;
    const testUser = {
            name,
            email: `${name}@email.com`,
            password: '12345'
        };
    const testProduct = {
            name,
            slug: name,
            createdDate: new Date('2021-03-20'),
            viewsNumber,
            price: 0,
            description: name,
            images: [],
            draft: false
        };
    let user: User, product: Product, category: Category;

    beforeAll(async (): Promise<void> => {
        await app.start(port);

        user = await daoUser.create(testUser) as User;
        category = await daoCategory.create({ name, slug: name }) as Category;
        const productParams = [
            user.id, category.id, testProduct.name, testProduct.slug, 
            testProduct.createdDate, testProduct.viewsNumber, 
            testProduct.price, testProduct.description, testProduct.images, testProduct.draft
        ];
        const createdProduct = await db.query(productModel.create, productParams);
        product = createdProduct.rows[0] as Product;
    });

    afterAll(async (): Promise<void> => {
        await daoProducts.remove(product.id);
        await daoCategory.remove(category.id);
        await daoUser.remove(user.id);    
        await app.stop();
    }); 

    it('should increase the number of views when searching for a product by id', async (): Promise<void> => {
        let response: any = await daoProducts.findByIdWI(product.id);
        viewsNumber++;
        expect(response?.number_of_views).toEqual(viewsNumber);

        response = await daoProducts.findByIdWI(product.id) as Product;
        viewsNumber++;
        expect(response?.number_of_views).toEqual(viewsNumber);

        response = await daoProducts.findByIdWI(product.id) as Product;
        viewsNumber++;
        expect(response?.number_of_views).toEqual(viewsNumber);
    });

    it('should increase the number of views when searching for a product by name', async (): Promise<void> => {
        let response: any = await daoProducts.findByName(product.name);
        viewsNumber++;
        expect(response?.number_of_views).toEqual(viewsNumber);

        response = await daoProducts.findByName(product.name) as Product;
        viewsNumber++;
        expect(response?.number_of_views).toEqual(viewsNumber);

        response = await daoProducts.findByName(product.name) as Product;
        viewsNumber++;
        expect(response?.number_of_views).toEqual(viewsNumber);
    });
});
