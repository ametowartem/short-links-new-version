import {
  Body,
  Controller,
  Get,
  Header,
  HttpStatus,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CreateUserRequestDto } from '../dto/create-user.request.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guard/auth.guard';
import { UserId } from '../decorator/user.decorator';
import { ChangeUserRequestDto } from '../dto/change-user.request.dto';
import { AddMailRequestDto } from '../../link/dto/add-mail.request.dto';
import { VerifyMailRequestDto } from '../dto/verify-mail.request.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { IUploadFile } from '../interface/add-avatar.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/registry')
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  async registry(@Body() body: CreateUserRequestDto): Promise<void> {
    await this.userService.registry(body);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('change')
  async changeUser(
    @Body() dto: ChangeUserRequestDto,
    @UserId() userId: string,
  ) {
    // const user = await this.userService.findOneByUuid(userUuid);
    return await this.userService.changeUser(dto, userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('mail')
  async addMail(@Body() dto: AddMailRequestDto, @UserId() _id: string) {
    await this.userService.addMail(dto, _id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('verify')
  async verifyMail(@Body() dto: VerifyMailRequestDto, @UserId() _id: string) {
    return await this.userService.verifyMail(dto, _id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('upload-avatar')
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
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @UserId() _id: string,
  ) {
    await this.userService.addAvatar({
      _id: _id,
      file: file,
    } as IUploadFile);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('avatar')
  @Header('Content-Type', 'image/jpeg')
  async getFile(@UserId() _id: string): Promise<StreamableFile> {
    const file = await this.userService.getUserAvatar(_id);

    return new StreamableFile(file);
  }
}
