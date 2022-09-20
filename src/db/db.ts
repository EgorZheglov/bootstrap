import { Pool, QueryResult } from 'pg';

import { DATABASE, DB_PORT, HOST, PASSWORD, USER_DB } from '../config';
import { errors } from '../messages';

const { CONNECTION_NOT_CREATED } = errors;

let pool: Pool | null = null;

const createPool = (): Pool =>
  new Pool({
    user: USER_DB,
    host: HOST,
    database: DATABASE,
    password: PASSWORD,
    port: DB_PORT,
  });

export default {
  connect: async (cb?: (err?: Error) => void): Promise<Pool> => {
    if (pool === null) {
      pool = createPool();
    }
    if (cb) {
      cb();
    }
    return pool;
  },

  disconnect: async (
    cb?: ((err?: Error) => void) | undefined
  ): Promise<void> => {
    if (cb) {
      cb();
    }
    if (pool) {
      await pool.end();
      pool = null;
    }
  },

  query: async (
    queryReq: string,
    params?: Array<any>
  ): Promise<QueryResult> => {
    if (!pool) throw new Error(CONNECTION_NOT_CREATED);
    return pool.query(queryReq, params);
  },
};
