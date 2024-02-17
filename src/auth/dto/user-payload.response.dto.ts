import { ApiProperty } from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, IsOptional, IsString} from 'class-validator';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserPayloadResponseDto {
  constructor(data: Required<UserPayloadResponseDto>) {
    Object.assign(this, data);
  }

  @Field(() => String)
  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @Field(() => String, { nullable: true })
  @ApiProperty({
    example: 'ametowartem@gmail.com',
  })
  @IsEmail()
  @IsOptional()
  mail: string;
}
