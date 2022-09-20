import { NextFunction, Request, Response, Router } from 'express';
import to from 'await-to-js';

import { Category, ERR } from '../../types';
import { error } from '../../libs/log';
import { messages } from '../../messages';
import adminOnly from '../../middlewares/check-admin-access.middleware';
import sanitizeRequests from '../../middlewares/sanitize-requests.middleware';
import { create, update } from '../../controllers/categories-controller';

const router = Router();
const { CATEGORY_DELETED, CATEGORY_UPDATED } = messages;
const mockData = [
  {
    id: 4,
    name: 'Category Name',
    slug: 'ThisCategorySlug',
  },
];

router.get(
  '/categories',
  async (req: Request, res: Response, next: NextFunction) => {
    const promise = Promise.resolve(mockData);
    const [err, list] = await to(promise);
    if (err) {
      error(err);
      return next(ERR.BAD_REQUEST);
    }
    return res.status(200).send(list);
  }
);

router.post(
  '/categories',
  adminOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = {
      name: req.body.name,
      slug: req.body.slug,
    };
    const [err, response] = await to<Category>(create(payload));
    if (err) {
      error(err);
      return next(ERR.CANNOT_CREATE_CATEGORY);
    }
    return res.status(201).send(response);
  }
);

router.get(
  '/categories/:categoryId',
  sanitizeRequests,
  async (req: Request, res: Response, next: NextFunction) => {
    const promise = Promise.resolve(mockData);
    const [err, category] = await to(promise);
    if (err) {
      error(err);
      return next(ERR.BAD_REQUEST);
    }
    return res.status(200).send(category);
  }
);

router.put(
  '/categories/:categoryId',
  sanitizeRequests,
  adminOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = {
      id: req.params.categoryId,
      name: req.body.name,
      slug: req.body.slug,
    };
    const [err] = await to<Category>(update(payload));
    if (err) {
      error(err);
      return next(ERR.CANNOT_UPDATE_CATEGORY);
    }
    return res.status(200).send(CATEGORY_UPDATED);
  }
);

router.delete(
  '/categories/:categoryId',
  sanitizeRequests,
  adminOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const promise = Promise.resolve(categoryId);
    const [err] = await to(promise);
    if (err) {
      error(err);
      return next(ERR.BAD_REQUEST);
    }
    return res.status(200).send(CATEGORY_DELETED);
  }
);

export default router;
