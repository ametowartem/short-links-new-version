import { Test, TestingModule } from '@nestjs/testing';
import { LinkService } from '../service/link.service';
import { UserService } from '../../user/service/user.service';
import { REDIS_PROVIDER } from '../provider/link.provider';
import { ConfigService } from '../../core/service/config.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../user/schema/user.schema';
import { MINIO_CONNECTION } from 'nestjs-minio';
import { ILinkToShortLink } from '../interface/link-to-short-link.interface';
import { Client } from 'minio';
import { ClientProxy } from '@nestjs/microservices';
import IORedis from 'ioredis';
import { Model } from 'mongoose';
import * as nanoid from 'nanoid/non-secure';
import { IAddShortlink } from '../../user/interface/add-shortlink.interface';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserLinksInterface } from '../interface/user-links.interface';
import { AwsService } from '../../aws/service/aws.service';

describe('LinkService', () => {
  let linkService: LinkService;
  let userService: UserService;
  let configService: ConfigService;
  let mailingClient: ClientProxy;
  let redis: IORedis;
  let userModel: Model<User>;

  const mockLinkService = {
    get: jest.fn(),
    set: jest.fn(),
  };
  const mockUserModel = {};

  const mockUser: User = {
    _id: '65ca3d4e77df6f150f60f927',
    username: 'admin',
    password: '$2b$10$wZHmwKt7EPo5pnMerVTyPucRf6zFqGXLZkwEHj7fwJupVkbULHd5u',
    avatarPath:
      '106e33bb-4cc6-4958-b556-ac8a1a86cbaa-579a0c4a-abe5-4104-b263-742605bb92a1-Untitled_logo_1_free-file.jpg',
    mail: 'ametowartem@gmail.com',
    shortLinks: 'linay-rush',
  };

  beforeEach(async () => {
    const mockedModule: TestingModule = await Test.createTestingModule({
      providers: [
        LinkService,
        UserService,
        ConfigService,
        AwsService,
        {
          provide: REDIS_PROVIDER,
          useValue: mockLinkService,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: 'MAILING',
          useValue: mockLinkService,
        },
      ],
    }).compile();

    linkService = mockedModule.get<LinkService>(LinkService);
    userService = mockedModule.get<UserService>(UserService);
    configService = mockedModule.get<ConfigService>(ConfigService);
    mailingClient = mockedModule.get<ClientProxy>('MAILING');
    redis = mockedModule.get<IORedis>(REDIS_PROVIDER);
    userModel = mockedModule.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(linkService).toBeDefined();
  });

  describe('linkToShort', () => {
    const dto = {
      longLink: 'http://google.com',
      _id: mockUser._id,
    } as ILinkToShortLink;
    const mockedCode = 'mockedCode';
    const mockedLink = 'mockedLink';

    it('should check link, check if it exists in redis, create short link for this link and add it to user entity', async () => {
      jest.spyOn(nanoid, 'nanoid').mockReturnValue(mockedCode);
      jest.spyOn(userService, 'addShortLink').mockResolvedValueOnce(mockUser);
      jest.spyOn(redis, 'get').mockResolvedValueOnce('');

      const result = await linkService.linkToShort(dto);

      expect(redis.set).toHaveBeenCalledTimes(2);
      expect(redis.set).toHaveBeenNthCalledWith(1, mockedCode, dto.longLink);
      expect(redis.set).toHaveBeenNthCalledWith(2, `${mockedCode}:redirect`, 0);

      expect(userService.addShortLink).toHaveBeenCalledWith({
        _id: dto._id,
        shortLink: mockedCode,
      } as IAddShortlink);

      expect(result).toEqual(mockedCode);
    });

    it('should find link in redis and throw bad request exception', async () => {
      jest.spyOn(redis, 'get').mockResolvedValueOnce('mockedLink');

      await expect(linkService.linkToShort(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should check link, check if it exists in redis, create short link depends on user link and add it to user entity', async () => {
      jest.spyOn(userService, 'addShortLink').mockResolvedValueOnce(mockUser);
      jest.spyOn(redis, 'get').mockResolvedValueOnce('');

      dto.userLink = mockedLink;
      const result = await linkService.linkToShort(dto);

      expect(redis.set).toHaveBeenCalledTimes(4);
      expect(redis.set).toHaveBeenNthCalledWith(1, mockedCode, dto.longLink);
      expect(redis.set).toHaveBeenNthCalledWith(2, `${mockedCode}:redirect`, 0);

      expect(userService.addShortLink).toHaveBeenCalledWith({
        _id: dto._id,
        shortLink: dto.userLink,
      } as IAddShortlink);

      expect(result).toEqual(dto.userLink);
    });
  });

  describe('linkFromShort', () => {
    const mockedLink = 'mockedLink';
    it('should try to find long link and throw not found exception', async () => {
      jest.spyOn(redis, 'get').mockResolvedValueOnce('');

      await expect(linkService.linkFromShort(mockedLink)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should find long link in redis and return if exists', async () => {
      jest.spyOn(redis, 'get').mockResolvedValueOnce(mockedLink);
      jest.spyOn(redis, 'get').mockResolvedValueOnce('5');

      const result = await linkService.linkFromShort(mockedLink);
      expect(redis.set).toHaveBeenCalledWith(`${mockedLink}:redirect`, 5 + 1);
      expect(result).toEqual(mockedLink);
    });
  });

  describe('getUserLinks', () => {
    const mockedLink = 'mockedLink';
    it('should throw not found exception', async () => {
      jest.spyOn(userService, 'findOneById').mockReturnThis();

      await expect(linkService.getUserLinks(mockUser._id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return list of user links', async () => {
      jest.spyOn(userService, 'findOneById').mockResolvedValueOnce(mockUser);
      jest.spyOn(redis, 'get').mockResolvedValueOnce(mockedLink);
      jest.spyOn(redis, 'get').mockResolvedValueOnce('5');

      const result = await linkService.getUserLinks(mockUser._id);

      const dto: UserLinksInterface[] = [
        {
          shortLink: `http://${configService.host}:${configService.port}/${mockUser.shortLinks}`,
          link: mockedLink,
          redirectCount: '5',
        },
      ];
      expect(result).toEqual(dto);
    });
  });
});
