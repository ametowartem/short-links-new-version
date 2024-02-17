import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetLongLinkParamsRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shortLink: string;
}
