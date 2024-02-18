import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { GqlUserId } from '../../user/decorator/gql-user-id.decorator';
import { Body, Req, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guard/gql-auth.guard';
import { LinkService } from '../service/link.service';
import { UserLinksResponseDto } from '../dto/user-links.response.dto';
import { GetShortLinkRequestDto } from '../dto/get-short-link.request.dto';
import { GetShortLinkResponseDto } from '../dto/get-short-link.response.dto';

@Resolver()
export class LinkResolver {
  constructor(private readonly linkService: LinkService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [UserLinksResponseDto])
  async getUserLinks(@GqlUserId() _id: Types.ObjectId) {
    const links: UserLinksResponseDto[] = await this.linkService.getUserLinks(
      _id,
    );
    return links;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => GetShortLinkResponseDto)
  async getShortLink(
    @Args('body') dto: GetShortLinkRequestDto,
    @Req() request,
    @GqlUserId() _id: Types.ObjectId,
  ) {
    return new GetShortLinkResponseDto({
      shortLink: `http://${
        request.headers.host
      }/${await this.linkService.linkToShort(
        dto.link,
        _id,
        dto.userLink || undefined,
      )}`,
    });
  }
}
