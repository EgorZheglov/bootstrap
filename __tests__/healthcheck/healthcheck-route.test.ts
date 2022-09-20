import app from '../../src/app';
import axios from 'axios';

describe('Server', (): void => {
    const port = 3001;
    const path = `http://localhost:${port}/healthcheck`;

    it('should return 200 status if it responds', async (): Promise<void> => {
        await app.start(port);

        const result = await axios.get(path);
        expect(result.status).toBe(200);
        
        await app.stop();
    });
});