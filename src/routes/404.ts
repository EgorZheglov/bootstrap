import { Request, Response, Router, NextFunction } from 'express';

const notFoundRouter = Router();

notFoundRouter.use(
  '*',
  (req: Request, res: Response, next: NextFunction): void => {
    res.sendStatus(404);
  }
);

export default notFoundRouter;
