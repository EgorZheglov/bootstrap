import { NextFunction, Request, Response, Router } from 'express';
import to from 'await-to-js';

import { ERR, ProductSearchRequest, TokenInfo } from '../../types';
import {
  create,
  find,
  findById,
  remove,
  update,
} from '../../controllers/products-controller';
import { error } from '../../libs/log';
import { messages } from '../../messages';
import {
  productDeleteMw,
  productFindByIdMw,
  productUpdateMw,
} from '../../middlewares/product.middleware';
import adminOnly from '../../middlewares/check-admin-access.middleware';
import sanitizeRequests from '../../middlewares/sanitize-requests.middleware';
import jwt from '../../libs/jwt';

const router = Router();
const { PRODUCT_DELETED, PRODUCT_UPDATED } = messages;

router.post(
  '/products',
  adminOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = {
      author_id: req.body.authorId,
      category_id: req.body.categoryId,
      name: req.body.name,
      slug: req.body.slug,
      number_of_views: req.body.viewsNumber,
      price: req.body.price,
      description: req.body.description,
      images: req.body.images,
      draft: req.body.draft,
    };
    const [err, product] = await to(create(payload));
    if (err) {
      error(err);
      return next(ERR.BAD_REQUEST);
    }
    return res.status(201).send(product);
  }
);

/*
  request examples
  for category
  http://localhost:3000/api/products?page=1&perPage=3&orderBy=price&order=asc&category=Pizza
  &minPrice=100&maxPrice=1000&minCreatedAt=2021-01-01&maxCreatedAt=2021-06-30
  for name
  http://localhost:3000/api/products?page=1&perPage=3&orderBy=price&order=asc&name=Frozen
  for default
  http://localhost:3000/api/products
  */

router.get(
  '/products',
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as ProductSearchRequest;
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const userInfo = await jwt.check(req.headers.authorization!.split(' ')[1]);
    // TODO recieve default maxPrice from DB & delete magic default nums
    const payload: ProductSearchRequest = {
      ...req.query,
      minCreatedAt: query.minCreatedAt
        ? new Date(query.minCreatedAt)
        : new Date('2021-01-01'),
      maxCreatedAt: query.maxCreatedAt
        ? new Date(query.maxCreatedAt)
        : new Date(),
      minPrice: query.minPrice ? query.minPrice : 0,
      maxPrice: query.maxPrice ? query.maxPrice : 1000,
      page: query.page ? query.page : 1,
      perPage: query.perPage ? query.perPage : 5,
      orderBy: query.orderBy ? query.orderBy : 'name',
      order: query.order ? query.order : 'asc',
      draft: query.draft,
    };
    const [err, list] = await to(find(payload, (userInfo as TokenInfo).role));
    if (err) {
      error(err);
      return next(ERR.BAD_REQUEST);
    }
    return res.status(200).send(list);
  }
);

router.get(
  '/products/:productId',
  sanitizeRequests,
  productFindByIdMw,
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.productId;
    const [err, response] = await to(findById(id));
    if (err) {
      error(err);
      return next(ERR.ERROR_DURING_EXECUTING);
    }

    return res.status(200).send(response);
  }
);

router.put(
  '/products/:productId',
  sanitizeRequests,
  productUpdateMw,
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const [err] = await to(update(data));
    if (err) {
      error(err);
      return next(ERR.ERROR_DURING_EXECUTING);
    }

    return res.status(200).send(PRODUCT_UPDATED);
  }
);

router.delete(
  '/products/:productId',
  sanitizeRequests,
  productDeleteMw,
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.productId;
    const [err] = await to(remove(id));
    if (err) {
      error(err);
      return next(ERR.ERROR_DURING_EXECUTING);
    }

    return res.status(200).send(PRODUCT_DELETED);
  }
);

export default router;
