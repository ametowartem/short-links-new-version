import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserLinksResponseDto {
  // constructor(data: Required<UserLinksResponseDto>) {
  //   Object.assign(this, data);
  // }

  @Field(() => String)
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shortLink: string;

  @Field(() => String)
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  link: string;

  @Field(() => String)
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  redirectCount: string;
}
