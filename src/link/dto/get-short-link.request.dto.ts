import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class GetShortLinkRequestDto {
  @Field(() => String)
  @ApiProperty({
    example: 'https://google.com',
  })
  @IsUrl()
  @IsNotEmpty()
  link: string;

  @Field(() => String, { nullable: true })
  @ApiProperty({
    example: 'linay-rush',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  userLink?: string;
}
