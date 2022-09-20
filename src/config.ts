import dotenv from 'dotenv';
import fs from 'fs';
import ms from 'ms';

const configPath = process.platform === 'win32' ? '.env.win' : '.env';
const envConfig = process.env.NODE_ENV === 'test' ? '.env.test' : null;

if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'dev') {
  const buffer = envConfig
    ? Buffer.concat([
        fs.readFileSync(configPath),
        Buffer.from('\n'),
        fs.readFileSync(envConfig),
      ])
    : fs.readFileSync(configPath);

  const config = dotenv.parse(buffer);

  for (const key in config) {
    process.env[key] = config[key];
  }
}

export const PORT = Number(process.env.PORT);
export const { USER_DB } = process.env;
export const { HOST } = process.env;
export const { DATABASE } = process.env;
export const { PASSWORD } = process.env;
export const DB_PORT = Number(process.env.DB_PORT);

export const { AUTH0_URL } = process.env;
export const { CLIENT_ID } = process.env;
export const { CLIENT_SECRET } = process.env;
export const { JWT_ACCESS_SECRET } = process.env;
export const { JWT_REFRESH_SECRET } = process.env;
export const { ACCESS_TOKEN_EXPIRES } = process.env;
export const { REFRESH_TOKEN_EXPIRES } = process.env;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
export const REFRESH_TOKEN_CACHE_TTL = ms(REFRESH_TOKEN_EXPIRES!) / 1000;
export const ACCESS_TOKEN_CACHE_TTL = ms(ACCESS_TOKEN_EXPIRES!) / 1000;
/* eslint-enable @typescript-eslint/no-non-null-assertion */
export const { AUTH_CONNECTION } = process.env;
export const HASH_EXPIRES = Number(process.env.HASH_EXPIRES);
export const FILE_LIMIT_1MB = Number(process.env.FILE_LIMIT_1MB);
export const FILE_UPLOAD_DIRECTORY = String(process.env.FILE_UPLOAD_DIRECTORY);
export const { PASSWORD_SALT } = process.env;
export const { CHANGE_LOGS_DIR, CHANGE_LOGS_SCRIPTS_DIR, DB_MIGRATION_FILE } =
  process.env;
export const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL);
export const ADMIN_PASS = String(process.env.ADMIN_PASS);
export const ADMIN_NAME = String(process.env.ADMIN_NAME);
export const PRODUCTS_FILTER_CACHE_TTL = Number(
  process.env.PRODUCTS_FILTER_CACHE_TTL
);
export const CORS_ORIGINS = String(process.env.CORS_ORIGINS).split(';');
export const MAILSAC_URL = String(process.env.MAILSAC_URL);
export const MAILSAC_API_KEY = String(process.env.MAILSAC_API_KEY);
