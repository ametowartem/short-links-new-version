import {
  Controller,
  Get,
  Header,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../auth/guard/auth.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UserId } from '../../user/decorator/user.decorator';
import { UserService } from '../../user/service/user.service';
import { InjectMinio } from 'nestjs-minio';
import { Client } from 'minio';

@Controller('file')
export class FileController {
  constructor(
    private readonly userService: UserService,
    @InjectMinio() private readonly minioClient: Client,
  ) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('avatar')
  @Header('Content-Type', 'image/jpeg')
  async getFile(@UserId() _id: string): Promise<StreamableFile> {
    const file = await this.userService.getUserAvatar(_id);

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
    await this.userService.addAvatar({
      _id: _id,
      file: file,
    });
  }
}
