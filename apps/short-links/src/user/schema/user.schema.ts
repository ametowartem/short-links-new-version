import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';

@Schema()
@ObjectType()
export class User {
  @Field(() => String, { nullable: true })
  _id?: string;

  @Prop({ required: true, unique: true })
  @Field(() => String)
  username: string;

  @Prop({ required: true })
  @Field(() => String)
  password: string;

  @Prop({ required: false })
  @Field(() => String, { nullable: true })
  mail?: string;

  @Prop()
  @Field(() => String, { nullable: true })
  avatarPath?: string;

  @Prop()
  @Field(() => String, { nullable: true })
  shortLinks?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
