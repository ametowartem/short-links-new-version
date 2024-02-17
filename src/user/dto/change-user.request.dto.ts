import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ChangeUserRequestDto {
  @Field(() => String, { nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  username?: string;

  @Field(() => String, { nullable: true })
  @ApiProperty()
  @IsString()
  @IsOptional()
  password?: string;

  @Field(() => String, { nullable: true })
  @ApiProperty()
  @IsEmail()
  @IsOptional()
  mail?: string;
}
