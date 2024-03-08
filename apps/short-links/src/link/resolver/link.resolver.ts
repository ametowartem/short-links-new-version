import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlUserId } from '../../user/decorator/gql-user-id.decorator';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guard/gql-auth.guard';
import { LinkService } from '../service/link.service';
import { UserLinksResponseDto } from '../dto/user-links.response.dto';
import { GetShortLinkRequestDto } from '../dto/get-short-link.request.dto';
import { GetShortLinkResponseDto } from '../dto/get-short-link.response.dto';
import { ILinkToShortLink } from '../interface/link-to-short-link.interface';

@Resolver()
export class LinkResolver {
  constructor(private readonly linkService: LinkService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [UserLinksResponseDto])
  async getUserLinks(@GqlUserId() _id: string) {
    const links: UserLinksResponseDto[] = await this.linkService.getUserLinks(
      _id,
    );
    return links;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => GetShortLinkResponseDto)
  async getShortLink(
    @Args('body') dto: GetShortLinkRequestDto,
    @Context() context,
    @GqlUserId() _id: string,
  ) {
    const { req } = context;

    return new GetShortLinkResponseDto({
      shortLink: `http://${
        req.headers.host
      }/${await this.linkService.linkToShort({
        longLink: dto.link,
        _id: _id,
        userLink: dto.userLink || undefined,
      } as ILinkToShortLink)}`,
    });
  }
}
