import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserRequestDto {
  @Field(() => String)
  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @Field(() => String)
  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @Field(() => String, { nullable: true })
  @ApiProperty({
    example: 'admin',
  })
  @IsEmail()
  @IsOptional()
  mail?: string;
}
