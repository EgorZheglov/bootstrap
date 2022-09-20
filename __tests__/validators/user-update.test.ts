import { 
    userFindByIdValidator as ValidatorId, 
    userUpdateValidator as Validator
} from '../../src/validators/user-update.validator';

describe('Test user ID to find user to update', (): void => {
    it('Empty data', (): void => {
        const user = {};
        const { error, value } = ValidatorId(user);
        expect(error?.details[0].message).toBe('"id" is required');
    });

    it('id is not allowed to be empty', (): void => {
        const user = {
            id: 'a'
        }
        const { error, value } = ValidatorId(user);
        expect(error?.details[0].message).toBe('"id" must be a number');
    });
})

describe('Test user data for update user', (): void => {
    it('Empty data', (): void => {
        const user = {};
        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"id" is required');
    });

    it('name is required', (): void => {
        const user = {
            id: 1,
        };
        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"name" is required');
    });

    it('email is required', (): void => {
        const user = {
            id: 1,
            name: 'UserNormalName',
        };
        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"email" is required');
    });

    it('password is required', (): void => {
        const user = {
            id: 1,
            name: 'UserNormalName',
            email: 'email@email.com'
        };
        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"password" is required');
    });

    it('role is required', (): void => {
        const user = {
            id: 1,
            name: 'UserNormalName',
            email: 'email@email.com',
            password: '123456'
        };
        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"role" is required');
    });

    it('is_active is required', (): void => {
        const user = {
            id: 1,
            name: 'UserNormalName',
            email: 'email@email.com',
            password: '123456',
            role: 'user'
        };
        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"is_active" is required');
    });

    it('Name is not allowed to be empty', (): void => {
        const user = {
            id: 1,
            name: ''
        };
        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"name" is not allowed to be empty');
    });

    it('Email is not allowed to be empty', (): void => {
        const user = {
            id: 1,
            name: 'UserNormalName',
            email: ''
        };
        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"email" is not allowed to be empty');
    });

    it('Password is not allowed to be empty', (): void => {
        const user = {
            id: 1,
            name: 'UserNormalName',
            email: 'email@email.com',
            password: ''
        };
        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"password" is not allowed to be empty');
    });

    it('Role is not allowed to be empty', (): void => {
        const user = {
            id: 1,
            name: 'UserNormalName',
            email: 'email@email.com',
            password: '12345',
            role: ''
        };
        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"role" is not allowed to be empty');
    });

    it('Name length must be at least 10 characters long', (): void => {
        const user = {
            id: 1,
            name: 'ShortName'
        };
        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"name" length must be at least 10 characters long');
    });

    it('Name length must be less than or equal to 100 characters long', (): void => {
        const user = {
            id: 1,
            name: 'VeryLongNameVeryLongNameVeryLongNameVeryLongNameVeryLongNameVeryLongNameVeryLongNameVeryLongNameVeryLongNameVeryLongName'
        };
        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"name" length must be less than or equal to 100 characters long');
    });

    it('Email must be a valid email', (): void => {
        const user = {
            id: 1,
            name: 'UserNormalName',
            email: 'wrong',
        };
        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe('"email" must be a valid email');
    });

    it('Short password', (): void => {
        const user = {
            id: 1,
            name: 'UserNormalName',
            email: 'email@email.com',
            password: '12',
        };
        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe(`"password" with value "${value.password}" fails to match the required pattern: /^[a-zA-Z0-9]{3,30}$/`);
    });

    it('Long password', (): void => {
        const user = {
            id: 1,
            name: 'UserNormalName',
            email: 'email@email.com',
            password: 'LongPasswordLongPasswordLongPassword',
        };
        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe(`"password" with value "${value.password}" fails to match the required pattern: /^[a-zA-Z0-9]{3,30}$/`);
    });

    it('Incorrect password', (): void => {
        const user = {
            id: 1,
            name: 'UserNormalName',
            email: 'email@email.com',
            password: 'passwordWithSymbols~:-+',
        };
        const { error, value } = Validator(user);
        expect(error?.details[0].message).toBe(`"password" with value "${value.password}" fails to match the required pattern: /^[a-zA-Z0-9]{3,30}$/`);
    });

    it('Correct user data', (): void => {
        const user = {
            id: 1,
            name: 'UserNormalName',
            email: 'email@email.com',
            password: '123456',
            role: 'user',
            is_active: true,
        };
        const { error, value } = Validator(user);
        expect(error?.details[0].message).toEqual(undefined);
    });
});
