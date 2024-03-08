import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MessageStatus } from '../const/message.status.enum';
import { SchemaTypes } from 'mongoose';

@Schema()
export class Message {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: string;

  @Prop({ required: true })
  sender: string;

  @Prop({ required: true })
  recipient: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Date, required: false })
  timeSending?: Date;

  @Prop({ type: String, required: false })
  status?: MessageStatus;

  @Prop({ required: false })
  errorMessage?: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
