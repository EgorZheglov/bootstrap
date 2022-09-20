import { NextFunction, Request, Response, Router } from 'express';
import path from 'path';
import to from 'await-to-js';
import { UploadedFile } from 'express-fileupload';

import { ERR } from '../types';
import generateFileName from '../libs/file-name-generator';
import { FILE_UPLOAD_DIRECTORY, FILE_LIMIT_1MB } from '../config';
import { errors } from '../messages';
import { error } from '../libs/log';

const router = Router();
const { ERROR_UPLOADING, WRONG_TYPE_UPLOADING, ERROR_UPLOADING_SIZE } = errors;

router.post(
  '/uploads',
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.files) return next(ERR.ERROR_UPLOADING);
    const files: UploadedFile[] = Array.isArray(req.files.images)
      ? req.files.images
      : [req?.files.images];
    const uploadResult = await files.reduce(async (acc, file: UploadedFile) => {
      const result: { [key: string]: {} } = await acc;
      const errorsList: string[] = [];
      let isValidFile = true;
      let fileName = '';

      if (file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg') {
        errorsList.push(WRONG_TYPE_UPLOADING);
        isValidFile = false;
      }
      if (file.size > FILE_LIMIT_1MB) {
        errorsList.push(ERROR_UPLOADING_SIZE);
        isValidFile = false;
      }
      if (isValidFile) {
        fileName = generateFileName(file.name);
        const savePath = path.join(FILE_UPLOAD_DIRECTORY, fileName);
        const [err] = await to(file.mv(savePath));

        if (err) {
          error(err);
          errorsList.push(ERROR_UPLOADING);
        }
      }
      if (errorsList.length) {
        const current = result.errors;
        const obj: { [key: string]: {} } = {};
        obj[file.name] = errorsList;
        result.errors = { ...current, ...obj };
      } else {
        const current = result.success;
        const obj: { [key: string]: {} } = {};
        obj[file.name] = fileName;
        result.success = { ...current, ...obj };
      }

      return result;
    }, Promise.resolve({}));

    return res.status(200).json(uploadResult);
  }
);

export default router;
