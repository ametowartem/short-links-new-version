import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetMailParamsDto {
  @ApiProperty({
    example: 'mailgun@sandboxb9c9bb4c4f7c4029bcc687ee98d3d20c.mailgun.org',
  })
  @IsEmail()
  @IsNotEmpty()
  sender: string;

  @ApiProperty({
    example: 'ametowartem@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  recipient: string;

  @ApiProperty({
    example: 'test',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    example: 'Hello world!',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  timeSending?: Date;
}
