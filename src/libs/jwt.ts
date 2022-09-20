import jwt, { JwtPayload } from 'jsonwebtoken';

import {
  ACCESS_TOKEN_EXPIRES,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  REFRESH_TOKEN_EXPIRES,
} from '../config';
import { TokenInfo } from '../types';

type Secrets = {
  access: string;
  refresh: string;
};

export default {
  create: (
    userInfo: TokenInfo
  ): { accessToken: string; refreshToken: string } => {
    const accessToken: string = jwt.sign(
      {
        email: userInfo.email,
        type: 'access',
        role: userInfo.role,
      },
      `${JWT_ACCESS_SECRET}`,
      { expiresIn: ACCESS_TOKEN_EXPIRES }
    );

    const refreshToken: string = jwt.sign(
      {
        email: userInfo.email,
        type: 'refresh',
      },
      `${JWT_REFRESH_SECRET}`,
      { expiresIn: REFRESH_TOKEN_EXPIRES }
    );

    return { accessToken, refreshToken };
  },

  check: async (token: string): Promise<boolean | JwtPayload> => {
    const secret: Secrets = {
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      access: JWT_ACCESS_SECRET!,
      refresh: JWT_REFRESH_SECRET!,
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
    };
    // Decoding to check if it really the token
    const decoded = jwt.decode(token);

    // If it really token
    if (decoded) {
      // If has our type defenition
      if ((decoded as JwtPayload).type) {
        try {
          // Some typescript magic
          return jwt.verify(
            token,
            secret[(decoded as JwtPayload).type as keyof Secrets]
          ) as JwtPayload;
        } catch (error) {
          // TODO: log or debug the reason
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
};
