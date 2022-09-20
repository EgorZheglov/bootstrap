import to from 'await-to-js';

import mailsac from '../libs/mailsac-api';
import { error } from '../libs/log';
import { MailsacResponse } from '../types';

export const emailValidation = async (email: string): Promise<boolean> => {
  if (!email || !email.length) {
    return false;
  }
  const [err, resp] = await to<MailsacResponse>(mailsac.get(`/${email}`));
  if (err) {
    error(err);
    return false;
  }
  /* eslint-disable-next-line  @typescript-eslint/no-non-null-assertion */
  const body = resp!.data;
  if (body.isValidFormat && !body.isDisposable) {
    return true;
  }
  return false;
};
