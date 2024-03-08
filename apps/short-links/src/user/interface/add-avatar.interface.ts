import { User } from '../schema/user.schema';
import * as Buffer from 'buffer';

export interface IAddAvatar {
  _id: string;
  file: IFileBuffer;
}

interface IFileBuffer {
  originalname: string;
  buffer: Buffer;
}
