import { to } from 'await-to-js';
import axios, { AxiosRequestConfig } from 'axios';
import { randomUUID } from 'crypto';
import app from '../../src/app';
import db from '../../src/db/db';
import accessTokensCache from '../../src/libs/access-tokens-cache';
import jwt from '../../src/libs/jwt';
import roles from '../../src/libs/roles';

describe('Test /users endpoint', (): void => {
    const port = 8004;
    const path = `http://localhost:${port}/api/users`;

    beforeAll(async (): Promise<void> => {
        await app.start(port);
    });

    afterAll(async (): Promise<void> => {
        await app.stop();
    }); 

    it('Test for method GET', async(): Promise<void> => {
        const headers = await createAccessHeaders("test1@test.com");
        const response = await axios.get(path, headers);
        expect(response.status).toEqual(200)
    });

    it('Test for method POST', async(): Promise<void> => {
        const headers = await createAccessHeaders("test1@test.com");
        const name = randomUUID();
        const email = `${name}@email.com`;
        const userData = {
            name,
            email,
            password: '123456',
            confirm_password: '123456'
        };

        const response = await axios.post(path, userData, headers);
        expect(response.status).toEqual(200);
        await to(db.query('delete from shop.users where email = $1', [email]));
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
