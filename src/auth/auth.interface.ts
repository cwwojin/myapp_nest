import { Request } from 'express';

/**
 * JWT Payload.
 */
export interface JwtPayload {
  id: string;
}

/**
 * Login.
 */
export interface LocalLoginRequest extends Request {
  user: {
    id: string;
  };
}
