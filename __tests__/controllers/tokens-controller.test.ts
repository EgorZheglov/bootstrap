import nock from 'nock';
import tk from 'timekeeper';

let TEMP_CLIENT_ID: string, TEMP_CLIENT_SECRET: string, TEMP_AUTH0_URL: string;

TEMP_CLIENT_ID = process.env.CLIENT_ID as string;
process.env.CLIENT_ID = '123';

TEMP_CLIENT_SECRET = process.env.CLIENT_SECRET as string;
process.env.CLIENT_SECRET = '456';

TEMP_AUTH0_URL = process.env.AUTH0_URL as string;
process.env.AUTH0_URL = 'http://test.com';

import { getAuth0Token } from '../../src/controllers/tokens-controller';
import cache from '../../src/libs/node-cache';

describe('System token controller', (): void => {
    afterAll((): void => {
        jest.resetModules();
        process.env.CLIENT_ID = TEMP_CLIENT_ID;
        process.env.CLIENT_SECRET = TEMP_CLIENT_SECRET;
        process.env.AUTH0_URL = TEMP_AUTH0_URL;
        tk.reset();
    })

    it('Should return system token', async (): Promise<void> => {
        const auth0mock = nock(process.env.AUTH0_URL as string)
            .post('/oauth/token')
            .reply(200, {"access_token": "Hy6HhY", "expires_in": 86400, "token_type": "Bearer"});

        const result = await getAuth0Token();

        auth0mock.done();

        expect(result).toBe("Hy6HhY");
    });

    it('Token should be saved in cache', async () => {

        const result = await getAuth0Token();

        expect(result).toBe('Hy6HhY');
        expect(cache.get('system_token')).toBe('Hy6HhY');
    });

    it('Cache should invalidate system token after expiretion of ttl', async () => {
        tk.travel(Number(cache.getTtl('system_token')) + 1);
        // in next second cached token becomes invalid
        expect(cache.get('system_token')).toBe(undefined);
    });

    it('System token controller should return new value and save it in cache', async () => {
        const auth0mock = nock(process.env.AUTH0_URL as string)
            .post('/oauth/token')
            .reply(200, {"access_token": "Hy6HhYZ", "expires_in": 86400, "token_type": "Bearer"});

        const result = await getAuth0Token();

        auth0mock.done();

        expect(result).toBe("Hy6HhYZ");
        expect(cache.get('system_token')).toBe("Hy6HhYZ");
    });
});
