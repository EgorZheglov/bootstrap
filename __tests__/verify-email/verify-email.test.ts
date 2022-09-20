import app from '../../src/app';
import axios, { AxiosRequestConfig } from 'axios';
import jwt from '../../src/libs/jwt';
import db from '../../src/db/db';
import userModel from '../../src/db/models/user';
import tokenModel from '../../src/db/models/activation-token';
import { randomUUID } from 'crypto';
import to from 'await-to-js';

describe('Test for /verify-email/:activation-token endpoint', (): void => {
    const port = 8023;
    beforeAll(async (): Promise<void> => {
        await app.start(port);
    });

    afterAll(async (): Promise<void> => {
        await app.stop();
    });

    it('Server should return 403 because token expired', async (): Promise<void> => {
        const testName = randomUUID();
        const activationToken = randomUUID();
        const testEmail = `${testName}@test.com`;
        await to(db.query(userModel.addUser, [testName, testEmail, 123]));
        await to(db.query(tokenModel.addToken, [testEmail, activationToken, new Date('12/31/2015')]));
        await axios.get(`http://localhost:${port}/verify-email/${activationToken}`)
        .catch((e) => expect(e.response.status).toBe(403))
        await to(db.query('delete from shop.users where email = $1', [testEmail]));
        await to(db.query('delete from shop.activation_tokens where email = $1', [testEmail]));
    });

    it('Server should return 200 status if email-verifying works', async (): Promise<void> => {
        const testName = randomUUID();
        const activationToken = randomUUID();
        const testEmail = `${testName}@test.com`;
        await to(db.query(userModel.addUser, [testName, testEmail, 123]));
        await to(db.query(tokenModel.addToken, [testEmail, activationToken, new Date(Date.now() + ( 3600 * 1000 * 24))]));
        const result = await axios.get(`http://localhost:${port}/verify-email/${activationToken}`);
        expect(result.status).toBe(200);
        await to(db.query('delete from shop.users where email = $1', [testEmail]));
        await to(db.query('delete from shop.activation_tokens where email = $1', [testEmail]));
    });

    it('Server should return 403 status if no token was sent', async (): Promise<void> => {
        await axios.get(`http://localhost:${port}/verify-email/naiveToken`)
        .catch((e) => expect(e.response.status).toBe(403))
    });
});