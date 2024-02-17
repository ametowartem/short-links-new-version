import { User } from '../schema/user.schema';
import { Document, Types } from 'mongoose';

export interface IAddAvatar {
  user;
  avatarPath: string;
}
