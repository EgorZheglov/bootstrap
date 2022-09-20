import axios, { AxiosRequestConfig } from 'axios';
import app from '../../src/app';
import accessTokensCache from '../../src/libs/access-tokens-cache';
import jwt from '../../src/libs/jwt';
import roles from '../../src/libs/roles';

describe('Test /category endpoint', (): void => {
    const port = 8010;
    const path = `http://localhost:${port}/api/categories`;
    const mockData = [
      {
        "id": 4,
        "name": "Category Name",
        "slug": "ThisCategorySlug"
      }
    ];

    beforeAll(async (): Promise<void> => {
        app.start(port);
    });

    afterAll(async (): Promise<void> => {
        app.stop();
    }); 

    it('Test for method GET', async(): Promise<void> => {
        const headers = await createAccessHeaders("test1@test.com");
        const response = await axios.get(path, headers);
        expect(response.status).toEqual(200);
        expect(response.data).toEqual(mockData);
    });

    it('Test for findById method', async(): Promise<void> => {
        const headers = await createAccessHeaders("test1@test.com");
        const response = await axios.get(path + '/1', headers);
        expect(response.status).toEqual(200);
        expect(response.data).toEqual(mockData);
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
