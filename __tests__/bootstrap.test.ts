import axios from 'axios';
import app from '../src/app';

describe("Application", (): void => {
  const port = 8007;
  const path = `http://localhost:${port}`;

  beforeAll(async (): Promise<void> => {
      await app.start(port);
  });

  afterAll(async (): Promise<void> => {
      await app.stop();
  });

  it("should listen to a given port", async (): Promise<void> => {
    const result = await axios.get(`${path}/swagger`);
    expect(result.status).toBe(200);
  })

  it("should return a 404 error if endpoint does not exist", async (): Promise<void> => {
    await axios.get(`${path}/pagedoesnotexist`).catch((e) => expect(e.response.status).toBe(404))
  })
})
