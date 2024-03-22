import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import IORedis from 'ioredis';
import { REDIS_PROVIDER } from '../provider/link.provider';
import { nanoid } from 'nanoid/non-secure';
import { UserService } from '../../user/service/user.service';
import * as process from 'process';
import { UserLinksInterface } from '../interface/user-links.interface';
import { ILinkToShortLink } from '../interface/link-to-short-link.interface';
import { ConfigService } from '../../core/service/config.service';

@Injectable()
export class LinkService {
  @Inject(REDIS_PROVIDER)
  private readonly redis: IORedis;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async linkToShort(dto: ILinkToShortLink) {
    if (!dto.longLink.includes('http') || dto.longLink.indexOf('http') !== 0) {
      dto.longLink = `http://${dto.longLink}`;
    }

    let shortLink;
    if (!dto.userLink) {
      shortLink = nanoid(6);
    } else {
      shortLink = dto.userLink;
    }

    const existOnRedis = await this.redis.get(shortLink);

    if (existOnRedis) {
      throw new BadRequestException('Данная ссылка уже существует!');
    }

    this.redis.set(shortLink, dto.longLink);
    this.redis.set(`${shortLink}:redirect`, 0);

    await this.userService.addShortLink({
      _id: dto._id,
      shortLink: shortLink,
    });

    return shortLink;
  }

  async linkFromShort(shortLink: string) {
    const existOnRedis = await this.redis.get(shortLink);

    if (!existOnRedis) {
      throw new NotFoundException();
    }

    const redirectCount = await this.redis.get(`${shortLink}:redirect`);
    this.redis.set(`${shortLink}:redirect`, +redirectCount + 1);

    return existOnRedis;
  }

  async getUserLinks(_id: string): Promise<UserLinksInterface[]> {
    const user = await this.userService.findOneById(_id);

    if (!user.shortLinks) {
      throw new NotFoundException('Пользователь не имеет коротких ссылок');
    }

    const links: UserLinksInterface[] = [];
    for (const el of user.shortLinks.split(',')) {
      links.push({
        shortLink: `http://${this.configService.host}:${this.configService.port}/${el}`,
        link: await this.redis.get(el),
        redirectCount: await this.redis.get(`${el}:redirect`),
      });
    }

    return links;
  }
}
