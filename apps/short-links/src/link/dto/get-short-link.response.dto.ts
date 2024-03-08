import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetShortLinkResponseDto {
  constructor(data: Required<GetShortLinkResponseDto>) {
    Object.assign(this, data);
  }

  @Field(() => String)
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shortLink: string;
}
