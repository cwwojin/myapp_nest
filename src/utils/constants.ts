/**
 * Bcrypt
 */
export const BCRYPT_SALTROUNDS = 5;
/**
 * For Base62
 */
export const HASH_MAXLENGTH = 6;
export const BASE62_CHARSET =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
/**
 * Password Constraint
 */
export const PASSWORD_PATTERN =
  /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*?_]).{8,16}$/;
