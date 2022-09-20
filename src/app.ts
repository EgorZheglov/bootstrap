import { Server } from 'http';
import YAML from 'yamljs';
import express, { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import addUniqueRequestId from './middlewares/unique-request-id.middleware';
import db from './db/db';
import dbMigration from './db/db-migration';
import dbSync from './db/db-tokens-sync';
import requestLogger from './libs/request-log';
import { FILE_LIMIT_1MB, CORS_ORIGINS } from './config';

import apiRouter from './routes';
import checkToken from './middlewares/check-token.middleware';
import dotenvRouter from './routes/dotenv';
import healthCheckRouter from './routes/healthcheck';
import login from './routes/login';
import notFoundRouter from './routes/404';
import errorHandlerRouter from './routes/500';
import signup from './routes/signup';
import verifyEmailRouter from './routes/verify-email';
import refreshRoute from './routes/refresh-token';
import cacheRequstMiddleware from './middlewares/cache-requst-middleware';
import adminOnly from './middlewares/check-admin-access.middleware';

const app: Application = express();
const swaggerDocument = YAML.load('./doc/api.yaml');
let server: Server;

const corsOptions = {
  origin: CORS_ORIGINS,
};

// middlwares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOptions));
app.use(addUniqueRequestId);
app.use(requestLogger);
app.use(cookieParser());
app.use(
  fileUpload({
    limits: { fileSize: FILE_LIMIT_1MB },
    abortOnLimit: true,
  })
);
app.use(cacheRequstMiddleware);

// routes
app.use(verifyEmailRouter);
app.use(healthCheckRouter);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(signup);
app.use(login);
app.use(refreshRoute);
app.use('/api', checkToken, apiRouter);
app.use('/dotenv', adminOnly, dotenvRouter);
app.use(errorHandlerRouter);
app.use(notFoundRouter);

export default {
  async start(port: number): Promise<Server> {
    server = app.listen(port, () => {
      console.log(`Server is listening on ${port} port`);
    });

    await db.connect();
    await dbMigration.update();
    await dbSync.syncDbAuthTokens();

    return server;
  },

  async stop(cb?: (err?: Error) => void): Promise<Server> {
    console.log(`\nTrying to close the server..\n`);

    await db.disconnect(cb);

    return server.close(cb);
  },
};
