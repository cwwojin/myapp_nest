import { BASE62_CHARSET } from './constants';

/**
 * Encode a number to a Base62 string of fixed length.
 *
 * @param n - number to encode
 * @returns The Base62 encoded string of `n`
 */
export function toBase62(n: number) {
  if (n === 0) {
    return '0';
  }
  let result = '';
  const digits = BASE62_CHARSET;
  while (n > 0) {
    result = digits[n % digits.length] + result;
    n = parseInt((n / digits.length).toString(), 10);
  }

  return result;
}

/**
 * Decode a Base62 string into a number.
 *
 * @param s - Base62 string to decode
 * @returns The decoded number
 */
export function fromBase62(s: string) {
  const digits = BASE62_CHARSET;
  let result = 0;
  for (let i = 0; i < s.length; i++) {
    const p = digits.indexOf(s[i]);
    if (p < 0) {
      return NaN;
    }
    result += p * Math.pow(digits.length, s.length - i - 1);
  }

  return result;
}

/**
 * Get File extension.
 */
export const getFileExtension = (originalname: string) =>
  originalname.split('.').slice(-1).toString();
