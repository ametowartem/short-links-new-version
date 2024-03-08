import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LinkService } from '../service/link.service';
import { GetLongLinkParamsRequestDto } from '../dto/get-long-link.params.request.dto';
import { GetShortLinkRequestDto } from '../dto/get-short-link.request.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { GetShortLinkResponseDto } from '../dto/get-short-link.response.dto';
import { AuthGuard } from '../../auth/guard/auth.guard';
import { UserId } from '../../user/decorator/user.decorator';
import { ILinkToShortLink } from '../interface/link-to-short-link.interface';

@Controller()
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Get('/userLinks')
  async getUserLinks(@UserId() _id: string) {
    return await this.linkService.getUserLinks(_id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Put('/link')
  @ApiResponse({
    type: GetShortLinkResponseDto,
    status: 200,
  })
  async getShortLink(
    @Body() dto: GetShortLinkRequestDto,
    @Req() request,
    @UserId() _id: string,
  ) {
    return new GetShortLinkResponseDto({
      shortLink: `http://${
        request.headers.host
      }/${await this.linkService.linkToShort({
        longLink: dto.link,
        _id: _id,
        userLink: dto.userLink,
      } as ILinkToShortLink)}`,
    });
  }

  @Get(':shortLink')
  @ApiBearerAuth()
  async redirectFromShortLink(
    @Param() dto: GetLongLinkParamsRequestDto,
    @Res() response,
  ) {
    const longLink = await this.linkService.linkFromShort(dto.shortLink);
    response.redirect(longLink);
  }
}
