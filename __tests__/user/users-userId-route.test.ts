import axios, { AxiosRequestConfig } from 'axios';
import { randomUUID } from 'crypto';

import app from '../../src/app';
import accessTokensCache from '../../src/libs/access-tokens-cache';
import jwt from '../../src/libs/jwt';
import * as userDao from '../../src/data-access/user.dao';
import * as tokenDao from '../../src/data-access/activation-token.dao';
import { NewUser, User } from '../../src/types';
import roles from '../../src/libs/roles';

describe('Test /users/:userId endpoint', (): void => {
    const port = 8001;
    const path = `http://localhost:${port}/api/users`;
    const name = randomUUID().substring(26);
    const testUserData: NewUser = {
        name,
        email: `${name}@email.com`,
        password: 'qwerty123'
    };
    let newUser: User | null = null;
    
    beforeAll(async (): Promise<void> => {
        await app.start(port);
        newUser = await userDao.create(testUserData);
    });

    afterAll(async (): Promise<void> => {
        await app.stop();
    });

    it('Test for method GET', async (): Promise<void> => {
        const headers = await createAccessHeaders('test1@test.com');
        const response = await axios.get(`${path}/${newUser!.id}`, headers);
        expect(response.status).toEqual(200);
    });

    it('Test for method PUT', async (): Promise<void> => {
        const headers = await createAccessHeaders('test1@test.com');
        if (!newUser) return;
        const bodyToUpdate = {
            id: newUser.id,
            name: 'UpdatedUserNamePUT',
            email: 'updatedUserIdEndpoint@email.com',
            password: 'qwerty123456',
            is_active: true,
            role: roles.user
        };
        const response = await axios.put(`${path}/${newUser.id}`, bodyToUpdate, headers);
        expect(response.status).toEqual(200);
        await tokenDao.removeByEmail(bodyToUpdate.email);
    });

    it('Test for method DELETE', async (): Promise<void> => {
        const headers = await createAccessHeaders('test1@test.com');
        if (!newUser) return;
        const response = await axios.delete(`${path}/${newUser.id}`, headers);
        expect(response.status).toEqual(200);
    });
});

async function createAccessHeaders(email : string): Promise<AxiosRequestConfig<any> | undefined> {
    const tokens = await jwt.create({email, 'role': roles.userAndAdmin});
    accessTokensCache.set(tokens.accessToken, email);
    const headers = {
        headers: {
            'Authorization': `Bearer ${tokens.accessToken}`
        }
    };
    return headers;
}
