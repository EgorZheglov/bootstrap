import axios, { AxiosResponse } from 'axios';
import tk from 'timekeeper';
import app from '../../src/app';
import nock from 'nock';
import db from '../../src/db/db'
import { randomUUID } from 'crypto';
import accessTokensCache from '../../src/libs/access-tokens-cache';
import refreshTokensCache from '../../src/libs/refresh-tokens-cache';
import roles from '../../src/libs/roles';
import { RefreshTokenInfo } from '../../src/types';

describe('e2e signup + email-activation+login', (): void => {
    // test user data
    const testName = randomUUID().substring(26); // short userName(10-length random value)
    const testUser = {
        name: `${testName}e2e`,
        email: `${testName}e2e@user.com`,
        password: '12345',
        confirm_password: '12345',
    };

    const port = 8022;
    const path = `http://localhost:${port}`;
    const headers = {
        headers: {
            Cookie: "access_token=value;"
        }
    };

    beforeAll(async (): Promise<void> => {
        await app.start(port);
    });

    afterAll(async (): Promise<void> => {
        await db.query(`DELETE FROM shop.users WHERE email = $1`, [testUser.email]);
        await db.query(`DELETE FROM shop.activation_tokens WHERE email = $1`, [testUser.email]);
        tk.reset();
        await app.stop();
    });   

    test('should sign-up user', async (): Promise<void> => {
        // Sign-up
        const auth0mock = nock(process.env.AUTH0_URL as string)
            .post('/oauth/token')
            .reply(200, {"access_token": "Hy6HhY", "expires_in": 86400, "token_type": "Bearer"})
            .post('/api/v2/users')
            .reply(
                200, 
                {
                    created_at: '2021-11-25T14:40:34.187Z',
                    email: testUser.email,
                    email_verified: false,
                    identities: [],
                    name: 'testfore2e@user.com',
                    nickname: 'testfore2e',
                    picture: 'https://s.gravatar.com/avatar/b59927fb9140134a3c547793991158cd?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fte.png',
                    updated_at: '2021-11-25T14:40:34.187Z',
                    user_id: 'auth0|619fa0628a4c39007207fbf8',
                    username: testUser.name
                });

        const responseFromSignup = await axios.post(`${path}/signup`, {
            name: testUser.name,
            email: testUser.email,
            password: testUser.password,
            confirm_password: testUser.confirm_password,
        }, headers);
    
        auth0mock.done();

        expect(responseFromSignup.status).toEqual(200);
        expect(typeof((responseFromSignup as AxiosResponse<any>).data)).toBe("string");
        expect((responseFromSignup as AxiosResponse<any>).data.length).toBeGreaterThan(0);
        // will update in the future to equaling with the real activation token, made by JWT 

        // Activation
        const responseFromActivation = await axios.get(`${path}/verify-email/${responseFromSignup.data}`);
        expect(responseFromActivation.status).toEqual(200);
        // will update in the future to equaling with the real user email, when verifying is done.
        // also here gonna take activated email for the next units

        // Login
        const responseFromLogin = await axios.post(
            `${path}/login`, 
            { 
              email: testUser.email, 
              password: testUser.password,
            }, 
            headers
        );
        const accessToken = (responseFromLogin as AxiosResponse<any>).data.accessToken;
        const refreshToken = (responseFromLogin as AxiosResponse<any>).data.refreshToken;

        expect(responseFromLogin.status).toEqual(200);
        expect(typeof(accessToken)).toBe("string");
        expect(accessToken.length).toBeGreaterThan(0);
        expect(typeof(refreshToken)).toBe("string");
        expect(refreshToken.length).toBeGreaterThan(0);
        //check tokens caches
        expect(accessTokensCache.get(accessToken)).toBe(testUser.email);
        expect(refreshTokensCache.get(refreshToken)).toStrictEqual({
            email: testUser.email,
            accessToken: (responseFromLogin as AxiosResponse<any>).data.accessToken,
            role: roles.user,
        });

        const authorizationHeaders = {
            headers: {
                'Authorization': `Bearer ${(responseFromLogin as AxiosResponse<any>).data.accessToken}`
            }
        };

        // Request to protected route
        const responseFromProducts = await axios.get(`${path}/api/products`, authorizationHeaders);
        expect(responseFromProducts.status).toEqual(200);

        //access token expires
        tk.travel(Number(accessTokensCache.getTtl(accessToken)) + 1);
        expect(accessTokensCache.get(accessToken)).toBe(undefined);
        expect(refreshTokensCache.get(refreshToken)).toStrictEqual({
            email: testUser.email,
            accessToken: (responseFromLogin as AxiosResponse<any>).data.accessToken,
            role: roles.user,
        });

        //referesh token expires
        tk.travel(Number(refreshTokensCache.getTtl((responseFromLogin as AxiosResponse<any>).data.refreshToken)));
        expect(accessTokensCache.get(accessToken)).toBe(undefined);
        expect(accessTokensCache.get(refreshToken)).toBe(undefined);
    }); 
});
