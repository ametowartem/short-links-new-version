import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class FileRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  filename: string;
}
