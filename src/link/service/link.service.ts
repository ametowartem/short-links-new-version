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
import { Types } from 'mongoose';
import { UserLinksInterface } from '../interface/user-links.interface';

@Injectable()
export class LinkService {
  @Inject(REDIS_PROVIDER)
  private readonly redis: IORedis;

  constructor(private readonly userService: UserService) {}

  async linkToShort(
    longLink: string,
    _id: Types.ObjectId,
    userLink = undefined,
  ) {
    if (!longLink.includes('http') || longLink.indexOf('http') !== 0) {
      longLink = `http://${longLink}`;
    }
    let shortLink;
    if (!userLink) {
      shortLink = nanoid(6);
    } else {
      shortLink = userLink;
    }

    const existOnRedis = await this.redis.get(shortLink);

    if (!existOnRedis) {
      this.redis.set(shortLink, longLink);
      this.redis.set(`${shortLink}:redirect`, 0);
    } else throw new BadRequestException('Данная ссылка уже существует!');

    await this.userService.addShortLink({
      _id: _id,
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

  async getUserLinks(_id: Types.ObjectId): Promise<UserLinksInterface[]> {
    const user = await this.userService.findOneById(_id);

    if (!user.shortLinks) {
      return;
    }

    const links: UserLinksInterface[] = [];
    for (const el of user.shortLinks.split(',')) {
      links.push({
        shortLink: `http://${process.env.HOST}:${process.env.PORT}/${el}`,
        link: await this.redis.get(el),
        redirectCount: await this.redis.get(`${el}:redirect`),
      });
    }

    return links;
  }
}
