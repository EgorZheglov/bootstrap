import Validator from '../../src/validators/user-create.validator';

describe('Test user data for create user', (): void => {
    it('Empty data', (): void => {
        const user = {};

        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"name" is required');
    });

    it('role is required', (): void => {
        const user = {
            name: 'UserNormalName'
        };

        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"role" is required');
    });

    it('is_active is required', (): void => {
        const user = {
            name: 'UserNormalName',
            role: 'user'
        };

        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"is_active" is required');
    });

    it('email is required', (): void => {
        const user = {
            name: 'UserNormalName',
            role: 'user',
            is_active: true
        };

        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"email" is required');
    });

    it('password is required', (): void => {
        const user = {
            name: 'UserNormalName',
            role: 'user',
            is_active: true,
            email: 'email@email.com'
        };

        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"password" is required');
    });

    it('Name is not allowed to be empty', (): void => {
        const user = {
            name: ''
        };

        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"name" is not allowed to be empty');
    });

    it('Role is not allowed to be empty', (): void => {
        const user = {
            name: 'UserNormalName',
            role: ''
        };

        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"role" is not allowed to be empty');
    });

    it('is_active is not allowed to be empty', (): void => {
        const user = {
            name: 'UserNormalName',
            role: 'user',
            is_active: ''
        };

        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"is_active" must be a boolean');
    });

    it('Email is not allowed to be empty', (): void => {
        const user = {
            name: 'UserNormalName',
            role: 'user',
            is_active: true,
            email: ''
        };

        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"email" is not allowed to be empty');
    });

    it('Password is not allowed to be empty', (): void => {
        const user = {
            name: 'UserNormalName',
            role: 'user',
            is_active: true,
            email: 'email@email.com',
            password: ''
        };

        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"password" is not allowed to be empty');
    });

    it('Name length must be at least 10 characters long', (): void => {
        const user = {
            name: 'ShortName'
        };

        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"name" length must be at least 10 characters long');
    });

    it('Name length must be less than or equal to 100 characters long', (): void => {
        const user = {
            name: 'VeryLongNameVeryLongNameVeryLongNameVeryLongNameVeryLongNameVeryLongNameVeryLongNameVeryLongNameVeryLongNameVeryLongName'
        };

        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"name" length must be less than or equal to 100 characters long');
    });

    it('is_active must be boolean', (): void => {
        const user = {
            name: 'UserNormalName',
            role: 'user',
            is_active: 'string'
        };

        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"is_active" must be a boolean');
    })

    it('Email must be a valid email', (): void => {
        const user = {
            name: 'UserNormalName',
            role: 'user',
            is_active: true,
            email: 'wrong',
        };

        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"email" must be a valid email');
    });

    it('Short password', (): void => {
        const user = {
            name: 'UserNormalName',
            role: 'user',
            is_active: true,
            email: 'email@email.com',
            password: '12',
        };

        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe(`"password" with value "${value.password}" fails to match the required pattern: /^[a-zA-Z0-9]{3,30}$/`);
    });

    it('Long password', (): void => {
        const user = {
            name: 'UserNormalName',
            role: 'user',
            is_active: true,
            email: 'email@email.com',
            password: 'LongPasswordLongPasswordLongPassword',
        };

        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe(`"password" with value "${value.password}" fails to match the required pattern: /^[a-zA-Z0-9]{3,30}$/`);
    });

    it('Incorrect password', (): void => {
        const user = {
            name: 'UserNormalName',
            role: 'user',
            is_active: true,
            email: 'email@email.com',
            password: 'passwordWithSymbols~:-+',
        };

        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe(`"password" with value "${value.password}" fails to match the required pattern: /^[a-zA-Z0-9]{3,30}$/`);
    });

    it('Correct user data', (): void => {
        const user = {
            name: 'UserNormalName',
            role: 'user',
            is_active: true,
            email: 'email@email.com',
            password: '123456',
        };

        const { error, value } = Validator(user);
        expect(error?.details[0].message).toEqual(undefined);
    });
});
