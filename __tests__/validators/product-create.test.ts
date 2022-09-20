import productCreateValidator from '../../src/validators/product-create.validator';

describe('Test product data to create', (): void => {
    it('Empty data', (): void => {
        const product = {};
        const { error, value } = productCreateValidator(product);
        expect(error?.details[0].message).toBe('"name" is required');
    });

    it('Slug is required', (): void => {
        const product = {
            name: 'ProductNormalName'
        };

        const { error, value } = productCreateValidator(product);
        expect(error?.details[0].message).toBe('"slug" is required');
    });

    it('Price is required', (): void => {
        const product = {
            name: 'ProductNormalName',
            slug: 'ThisProductJonhDoe'
        };

        const { error, value } = productCreateValidator(product);
        expect(error?.details[0].message).toBe('"price" is required');
    });

    it('Description is required', (): void => {
        const product = {
            name: 'ProductNormalName',
            slug: 'ThisProductJonhDoe',
            price: 10
        };

        const { error, value } = productCreateValidator(product);
        expect(error?.details[0].message).toBe('"description" is required');
    });

    it('Name is not allowed to be empty', (): void => {
        const product = {
            name: ''
        };

        const { error, value } = productCreateValidator(product);
        expect(error?.details[0].message).toBe('"name" is not allowed to be empty');
    });

    it('Slug is not allowed to be empty', (): void => {
        const product = {
            name: 'ProductNormalName',
            slug: ''
        };

        const { error, value } = productCreateValidator(product);
        expect(error?.details[0].message).toBe('"slug" is not allowed to be empty');
    });

    it('Price must be a number', (): void => {
        const product = {
            name: 'ProductNormalName',
            slug: 'ThisProductJonhDoe',
            price: ''
        };

        const { error, value } = productCreateValidator(product);
        expect(error?.details[0].message).toBe('"price" must be a number');
    });

    it('Description is not allowed to be empty', (): void => {
        const product = {
            name: 'ProductNormalName',
            slug: 'ThisProductJonhDoe',
            price: 40,
            description: ''
        };

        const { error, value } = productCreateValidator(product);
        expect(error?.details[0].message).toBe('"description" is not allowed to be empty');
    });

    it('Price value must be greater than 0', (): void => {
        const product = {
            name: 'ProductNormalName',
            slug: 'ThisProductJonhDoe',
            price: 0
        };

        const { error, value } = productCreateValidator(product);
        expect(error?.details[0].message).toBe('"price" must be a positive number');
    });

    it('Correct product data', (): void => {
        const product = {
            name: 'ProductNormalName',
            slug: 'ProductJonhDoe',
            price: 40,
            description: 'About JonhDoeJonhDoe JonhDoeJonhDoe'
        };

        const { error, value } = productCreateValidator(product);
        expect(error?.details[0].message).toEqual(undefined);
    });
});
