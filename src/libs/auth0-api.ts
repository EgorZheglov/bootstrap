import axios, { AxiosInstance } from 'axios';

import { AUTH0_URL } from '../config';

let instance: AxiosInstance | null = null;

export default instance = axios.create({
  baseURL: AUTH0_URL,
  timeout: 1000,
  headers: { 'X-Custom-Header': 'born-to-die' },
});
