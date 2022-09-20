import NodeCache from 'node-cache';
import { ACCESS_TOKEN_CACHE_TTL } from '../config';

const accessTokensCache = new NodeCache({ stdTTL: ACCESS_TOKEN_CACHE_TTL });

export default accessTokensCache;
