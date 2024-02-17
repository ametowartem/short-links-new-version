// import { UserEntity } from '../entity/user.entity';
import { User } from '../schema/user.schema';
import { Types } from 'mongoose';

export interface IAddShortlink {
  _id: Types.ObjectId;
  shortLink: string;
}
