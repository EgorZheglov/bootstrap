import { RestrictedResponseRoutes } from '../types';
import {
  restrictProductData,
  restrictMeData,
} from './restrict-request-functions';

export default function restrictRequest(
  type: RestrictedResponseRoutes,
  role: string
): string {
  switch (type) {
    case RestrictedResponseRoutes.PRODUCTS:
      return restrictProductData(role);
    case RestrictedResponseRoutes.ME:
      return restrictMeData(role);
    default:
      return '*';
  }
}
