import axios from 'axios';

import { MAILSAC_URL, MAILSAC_API_KEY } from '../config';

export default axios.create({
  baseURL: MAILSAC_URL,
  headers: {
    'Mailsac-Key': MAILSAC_API_KEY,
  },
});
