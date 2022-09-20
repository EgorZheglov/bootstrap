import axios, { AxiosRequestConfig } from 'axios';
import app from '../src/app';
import accessTokensCache from '../src/libs/access-tokens-cache';
import jwt from '../src/libs/jwt';
import roles from '../src/libs/roles';

describe('Test /signup endpoint', (): void => {
    const port = 8002;
    const path = `http://localhost:${port}/signup`;

    beforeAll(async (): Promise<void> => {
        await app.start(port);
    });

    afterAll(async (): Promise<void> => {
        await app.stop();
    });   

    it('Test for method POST without name', async (): Promise<void> => {
        const headers = await createAccessHeaders("test1@test.com");
        await axios.post(path, [], headers)
        .catch((e) => expect(e.response.status).toBe(400))

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
