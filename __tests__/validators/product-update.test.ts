import { productFindByIdValidator, productUpdateValidator } from '../../src/validators/product-update.validator';

describe('Test product ID to find product', (): void => {
    it('Empty data', () => {
        const product = {};
        const { error, value } = productFindByIdValidator(product);
        expect(error?.details[0].message).toBe('"id" is required');
    });

    it('id is not allowed to be empty', (): void => {
        const product = {
            id: 'abc'
        };

        const { error, value } = productFindByIdValidator(product);
        expect(error?.details[0].message).toBe('"id" must be a number');
    });
});

describe('Test product data for product updating', (): void => {
    it('Name is not allowed to be empty', (): void => {
        const product = {
            name: ''
        };

        const { error, value } = productUpdateValidator(product);
        expect(error?.details[0].message).toBe('"name" is not allowed to be empty');
    });

    it('Slug is not allowed to be empty', (): void => {
        const product = {
            name: 'ProductNormalName',
            slug: ''
        };

        const { error, value } = productUpdateValidator(product);
        expect(error?.details[0].message).toBe('"slug" is not allowed to be empty');
    });

    it('Price must be a number', (): void => {
        const product = {
            name: 'ProductNormalName',
            slug: 'ThisProductJonhDoe',
            price: ''
        };

        const { error, value } = productUpdateValidator(product);
        expect(error?.details[0].message).toBe('"price" must be a number');
    });

    it('Description is not allowed to be empty', (): void => {
        const product = {
            name: 'ProductNormalName',
            slug: 'ThisProductJonhDoe',
            price: 40,
            description: ''
        };

        const { error, value } = productUpdateValidator(product);
        expect(error?.details[0].message).toBe('"description" is not allowed to be empty');
    });

    it('Price value must be greater than 0', (): void => {
        const product = {
            name: 'ProductNormalName',
            slug: 'ThisProductJonhDoe',
            price: 0
        };

        const { error, value } = productUpdateValidator(product);
        expect(error?.details[0].message).toBe('"price" must be a positive number');
    });

    it('Correct product data', (): void => {
        const product = {
            name: 'ProductNormalName',
            slug: 'ProductJonhDoe',
            price: 40,
            description: 'About JonhDoeJonhDoe JonhDoeJonhDoe'
        };

        const { error, value } = productUpdateValidator(product);
        expect(error?.details[0].message).toEqual(undefined);
    });
});
