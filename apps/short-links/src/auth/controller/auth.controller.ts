import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthGuard } from '../guard/auth.guard';
import { SingInRequestDto } from '../dto/sing-in.request.dto';
import { ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SingInResponseDto } from '../dto/sing-in.response.dto';
import { UserPayloadResponseDto } from '../dto/user-payload.response.dto';
import { UserService } from '../../user/service/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiResponse({
    type: SingInResponseDto,
    status: HttpStatus.CREATED,
  })
  @Post('/')
  async signIn(@Body() dto: SingInRequestDto) {
    return (await this.authService.signIn({
      username: dto.username,
      password: dto.password,
    })) as SingInResponseDto;
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiResponse({
    type: UserPayloadResponseDto,
    status: HttpStatus.OK,
  })
  async getProfile(@Request() req): Promise<UserPayloadResponseDto> {
    const user = await this.userService.findOneById(req.user.id);
    return new UserPayloadResponseDto({
      username: user.username,
      mail: user.mail,
    });
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Put('logout')
  async logout(@Request() req) {
    const payload = req.user;
    await this.authService.logout(payload);
  }
}
