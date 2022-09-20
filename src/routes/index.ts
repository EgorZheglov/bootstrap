import { Router } from 'express';

import uploadRouter from './upload';
import categories from './categories';
import logout from './logout';
import products from './products';
import user from './user';
import me from './me';
import users from './users';

const api = Router();

api.use(user);
api.use(me);
api.use(users);
api.use(products);
api.use(categories);
api.use(logout);
api.use(uploadRouter);

export default api;
