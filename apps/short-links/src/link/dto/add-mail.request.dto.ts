import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class AddMailRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  mail: string;
}
