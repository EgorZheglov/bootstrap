import NodeCache from 'node-cache';
import { REFRESH_TOKEN_CACHE_TTL } from '../config';

const refreshTokensCache = new NodeCache({ stdTTL: REFRESH_TOKEN_CACHE_TTL });

export default refreshTokensCache;
