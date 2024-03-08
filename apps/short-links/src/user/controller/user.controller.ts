import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CreateUserRequestDto } from '../dto/create-user.request.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guard/auth.guard';
import { UserId } from '../decorator/user.decorator';
import { ChangeUserRequestDto } from '../dto/change-user.request.dto';
import { AddMailRequestDto } from '../../link/dto/add-mail.request.dto';
import { VerifyMailRequestDto } from '../dto/verify-mail.request.dto';

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
    await this.userService.changeUser(dto, userId);
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
    await this.userService.verifyMail(dto, _id);
  }
}
