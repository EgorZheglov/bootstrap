import axios, { AxiosRequestConfig } from 'axios';
import app from '../src/app';
import accessTokensCache from '../src/libs/access-tokens-cache';
import jwt from '../src/libs/jwt';
import roles from '../src/libs/roles';

describe('Test /logout endpoint', (): void => {
    const port = 8005;
    const path = `http://localhost:${port}/api/logout`;

    beforeAll(async (): Promise<void> => {
        await app.start(port);
    });

    afterAll(async (): Promise<void> => {
        await app.stop();
    });    

    it('Test for method GET', async (): Promise<void> => {
        const headers = await createAccessHeaders("test1@test.com");
        const response = await axios.get(path, headers);
        expect(response.status).toEqual(200);
    }); 

    it('Should return 403 status if no token', async (): Promise<void> => {
        await axios.get(path)
        .catch((e) => expect(e.response.status).toBe(403))
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
