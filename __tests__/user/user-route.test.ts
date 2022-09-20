import axios, { AxiosRequestConfig } from 'axios';
import { randomUUID } from 'crypto';

import app from '../../src/app';
import accessTokensCache from '../../src/libs/access-tokens-cache';
import jwt from '../../src/libs/jwt';
import * as userDao from '../../src/data-access/user.dao';
import * as tokenDao from '../../src/data-access/activation-token.dao';
import { NewUser, User } from '../../src/types';
import roles from '../../src/libs/roles';
import db from '../../src/db/db';

describe('Test /me endpoint', (): void => {
    const port = 8003;
    const path = `http://localhost:${port}/api/me`;
    const name = randomUUID().substring(26);

    const testUserData: NewUser = {
        name,
        email: `${name}@email.com`,
        password: 'qwerty123',
    };

    beforeAll(async (): Promise<void> => {
        await app.start(port);
    });

    afterAll(async (): Promise<void> => {
        await app.stop();
    }); 

    it('Test for method GET', async (): Promise<void> => {
        const email = 'test1@test.com';
        const headers = await createAccessHeaders(email, roles.userAndAdmin);
        const response = await axios.get(path, headers);
        expect(response.status).toEqual(200);
    });

    it('Test for method PUT', async (): Promise<void> => {
        const headers = await createAccessHeaders(
            testUserData.email, roles.user
        );
        const newUser = await userDao.create(testUserData);
        if (!newUser) return;
        const bodyToUpdate = {
            name: 'UpdatedUserName',
            email: 'updatedMeEndpoint@email.com',
            password: 'qwerty123456',
        };
        const response = await axios.put(path, bodyToUpdate, headers);
        expect(response.status).toEqual(200);
        
        await userDao.remove(newUser.id);
        await tokenDao.removeByEmail(bodyToUpdate.email);
    });

    it('Test for method DELETE', async (): Promise<void> => {
        const testUserSoftDelete: User = {
            id: '',
            name: 'testMeSoftDel',
            role: 'user',
            is_active: true,
            email: 'testMeSoftDel@email.com',
            password: 'qwerty123',
            deleted_at: null
        };
        const checkSoftDeleteQuery = 'select soft_delete from shop.users where email = $1';
        const headers = await createAccessHeaders(testUserSoftDelete.email, roles.user);
        const newUser = await userDao.create(testUserSoftDelete);
        if (!newUser) return;
        let resUpdatedUser = await db.query(checkSoftDeleteQuery, [testUserSoftDelete.email]);
        const resultBeforeSoftDelete = resUpdatedUser!.rows[0];
        expect(resultBeforeSoftDelete.soft_delete).toBeFalsy();
        await axios.delete(path, headers);
        resUpdatedUser = await db.query(checkSoftDeleteQuery, [testUserSoftDelete.email]);
        const resultAfterSoftDelete = resUpdatedUser!.rows[0];
        expect(resultAfterSoftDelete.soft_delete).toBeTruthy();
        await userDao.remove(newUser.id);
        await tokenDao.removeByEmail(testUserSoftDelete.email);
    });    
});

async function createAccessHeaders(email : string, role: string): Promise<AxiosRequestConfig<any> | undefined> {
    const tokens = await jwt.create({email, 'role': role});
    accessTokensCache.set(tokens.accessToken, email);
    const headers = {
        headers: {
            'Authorization': `Bearer ${tokens.accessToken}`
        }
    };
    return headers;
}
