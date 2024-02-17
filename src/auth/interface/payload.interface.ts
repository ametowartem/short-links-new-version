import { Types } from 'mongoose';

export interface PayloadInterface {
  username: string;
  id: string;
  jti: string;
  ext: number;
}
