import productFindByIdValidator from '../../src/validators/product-find.validator';

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
