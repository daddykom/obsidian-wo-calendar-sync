import { createHash } from 'crypto';

export const createLocalId = (input: string): string => {
  return createHash('sha1').update(input).digest('hex');
};
