import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const addUniqueRequestId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  req.id = uuidv4();

  next();
};

export default addUniqueRequestId;
