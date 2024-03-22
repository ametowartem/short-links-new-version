import {
  Controller,
  Get,
  Header,
  Param,
  Post,
  Req,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/guard/auth.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UserId } from '../../user/decorator/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from '../service/aws.service';
import { IUploadFile } from '../../user/interface/add-avatar.interface';
import { GetFileRequestDto } from '../dto/get-file.request.dto';

@Controller('file')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('get/:filename')
  @Header('Content-Type', 'image/jpeg')
  async getFile(@Param() dto: GetFileRequestDto): Promise<StreamableFile> {
    const file = await this.awsService.getFile(dto.filename);

    return new StreamableFile(file);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file', {}))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @UserId() _id: string,
  ) {
    await this.awsService.uploadFile({
      _id: _id,
      file: file,
    } as IUploadFile);
  }
}
