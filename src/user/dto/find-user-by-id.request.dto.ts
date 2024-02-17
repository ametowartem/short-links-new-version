import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class FindUserByIdRequestDto {
  @Field(() => String)
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  _id: string;
}
