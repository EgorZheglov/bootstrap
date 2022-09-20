import db from "../../src/db/db";
import {QueryResult} from "pg";

import { errors } from '../../src/messages';

describe('Test db connections', (): void => {

    const {ERROR_DURING_EXECUTING} = errors;

    beforeAll(async (): Promise<void> => {
        await db.connect();
    });

    afterAll(async (): Promise<void> => {
        await db.disconnect()
    });

    it('Test simple query', async (): Promise<void> => {
        let res = await db
            .query('SELECT NOW()')
            .then((res: QueryResult) => {
                const row = res.rows[0];
                return row;
            })
            .catch((err) => {
              throw new Error(`${ERROR_DURING_EXECUTING}: ${err}`);
            });
        expect(res["now"]).toBeDefined();
    });
});