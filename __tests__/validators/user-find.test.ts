import ValidatorId from '../../src/validators/user-find.validator';

describe('Test user ID to find user', (): void => {
    it('Empty data', (): void => {
        const user = {};

        const { error, value } = ValidatorId(user);
        expect(error?.details[0].message).toBe('"id" is required');
    });

    it('id is not allowed to be empty', (): void => {
        const user = {
            id: 'abc'
        }        

        const { error, value } = ValidatorId(user);
        expect(error?.details[0].message).toBe('"id" must be a number');
    });
});
