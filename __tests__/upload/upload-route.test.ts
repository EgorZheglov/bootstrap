import app from '../../src/app';
import fs from 'fs';
import accessTokensCache from '../../src/libs/access-tokens-cache';
import FormData from 'form-data';
import jwt from '../../src/libs/jwt';
import { errors } from '../../src/messages';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import roles from '../../src/libs/roles';

const { WRONG_TYPE_UPLOADING } = errors;

describe('Testing file uploading:', (): void => {
    const port = 3002;
    let token: string;
    const urlPath = `http://localhost:${port}/api/uploads`;
    const normalFilePath = __dirname + '/files/file_example_JPG_500kB.jpg';
    const normalFilePath2 = __dirname + '/files/file_example2_JPG_500kB.jpg';
    const bigSizeFilePath = __dirname + '/files/file_example_JPG_1500kB.jpg';
    const wrongTypeFilePath = __dirname + '/files/file_example_PNG_500kB.png';   
    beforeAll(async (): Promise<void> => {
        await app.start(port);
        token = await createAccessTokenForRole('testemail@test.com', roles.user);
    });

    afterAll(async (): Promise<void> => {
        await app.stop();
    });

    it('upload for big size jpg images', async (): Promise<void> => {
        const form_data = new FormData();
        const request_config = {
            headers: {
                authorization: `Bearer ${token}`,
                ...form_data.getHeaders(),
            },
            data: form_data
        };

        request_config.headers.authorization = `Bearer ${token}`

        form_data.append('images', fs.createReadStream(bigSizeFilePath));
        await axios.post(urlPath, form_data, request_config)
            .catch((e) => expect(e.response.status).toBe(413));
    }, 50000);

    it('upload for wrong type file', async (): Promise<void> => {
        const form_data = new FormData();
        const request_config = {
            headers: {
                authorization: `Bearer ${token}`,
                ...form_data.getHeaders(),
            },
            data: form_data
        };
        form_data.append('images', fs.createReadStream(wrongTypeFilePath));
        await axios.post(urlPath, form_data, request_config)
            .catch((e) => expect(e.response.status).toBe(413));
    });

    it('upload for normal size jpg image', async (): Promise<void> => {
        const form_data = new FormData();
        const request_config = {
            headers: {
                authorization: `Bearer ${token}`,
                ...form_data.getHeaders(),
            },
            data: form_data
        };
        form_data.append('images', fs.createReadStream(normalFilePath));
        const response = await axios.post(urlPath, form_data, request_config);
        const data = response.data as {
            success: {},
            errors: {}
        };
        const [savedFileName] = Object.values(data.success);
        const savedFilePath = `src/uploads/${savedFileName}`;
        const checkUploadedFile = fs.existsSync(savedFilePath);
        expect(checkUploadedFile).toBe(true);
        fs.unlinkSync(savedFilePath);
    });

    it('upload for array with different file types', async (): Promise<void> => {
        const form_data = new FormData();
        const request_config = {
            headers: {
                authorization: `Bearer ${token}`,
                ...form_data.getHeaders(),
            },
            data: form_data
        };

        form_data.append('images', fs.createReadStream(normalFilePath));
        form_data.append('images', fs.createReadStream(normalFilePath2));
        form_data.append('images', fs.createReadStream(wrongTypeFilePath));
        const response = await axios.post(urlPath, form_data, request_config);        
        const data = response.data as {
            success: {},
            errors: {}
        };
        const [savedFileName1, savedFileName2] = Object.values(data.success);
        const savedFilePath1 = `src/uploads/${savedFileName1}`;
        const savedFilePath2 = `src/uploads/${savedFileName2}`;
        const checkUploadedFile1 = fs.existsSync(savedFilePath1);
        const checkUploadedFile2 = fs.existsSync(savedFilePath2);
        const [savedErrors] = Object.values(data.errors) as string[];
        const [savedError] = savedErrors;

        expect(checkUploadedFile1).toBe(true);
        expect(checkUploadedFile2).toBe(true);
        expect(savedError).toBe(WRONG_TYPE_UPLOADING);

        fs.unlinkSync(savedFilePath1);
        fs.unlinkSync(savedFilePath2);
    });
});

async function createAccessTokenForRole(
    email: string,
    role: string
  ): Promise<string> {
    const tokens = await jwt.create({email, 'role': role});
    accessTokensCache.set(tokens.accessToken, email);
 
    return tokens.accessToken;
  }