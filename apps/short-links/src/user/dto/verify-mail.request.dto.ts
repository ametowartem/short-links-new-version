import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyMailRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  mail: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  verificationCode: string;
}
