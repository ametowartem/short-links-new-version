import { User } from '../src/user/schema/user.schema';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { LinkModule } from '../src/link/link.module';
import { ConfigService } from '../src/core/service/config.service';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { Model, Query } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { RmqService } from '@app/common';
import { UserService } from '../src/user/service/user.service';
import { AuthGuard } from '../src/auth/guard/auth.guard';
import { UserId } from '../src/user/decorator/user.decorator';
import { REDIS_PROVIDER } from '../src/link/provider/link.provider';
import IORedis from 'ioredis';
import { UserLinksInterface } from '../src/link/interface/user-links.interface';
import { GetShortLinkRequestDto } from '../src/link/dto/get-short-link.request.dto';
import { GetShortLinkResponseDto } from '../src/link/dto/get-short-link.response.dto';
import * as nanoid from 'nanoid/non-secure';

const mockUser: User = {
  _id: '65ca3d4e77df6f150f60f927',
  username: 'admin',
  password: '$2b$10$wZHmwKt7EPo5pnMerVTyPucRf6zFqGXLZkwEHj7fwJupVkbULHd5u',
  avatarPath:
    '106e33bb-4cc6-4958-b556-ac8a1a86cbaa-579a0c4a-abe5-4104-b263-742605bb92a1-Untitled_logo_1_free-file.jpg',
  mail: 'ametowartem@gmail.com',
  shortLinks: 'liba-dlya-minio',
};

const mockedLink = 'https://mockedlink.com';
const mockedRedirects = '5';

describe('Link', () => {
  let app: INestApplication;
  let jwtToken: string;
  let userModel: Model<User>;
  let userService: UserService;
  let configService: ConfigService;
  let redis: IORedis;

  const mockedService = {
    findOne: jest.fn(),
    findOneById: jest.fn().mockResolvedValue(mockUser),
    get: jest.fn(),
    set: jest.fn(),
    addShortLink: jest.fn(),
  };

  beforeAll(async () => {
    const mockedModule = await Test.createTestingModule({
      imports: [LinkModule],
      providers: [ConfigService],
    })
      .overrideProvider(getModelToken(User.name))
      .useValue(mockedService)
      .overrideProvider('MAILING')
      .useValue(mockedService)
      .overrideProvider(RmqService)
      .useValue(mockedService)
      .overrideProvider(UserService)
      .useValue(mockedService)
      .overrideProvider(REDIS_PROVIDER)
      .useValue(mockedService)
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = { id: mockUser._id };
          return true;
        },
      })
      .compile();

    app = mockedModule.createNestApplication();
    await app.init();

    userModel = mockedModule.get<Model<User>>(getModelToken(User.name));
    userService = mockedModule.get<UserService>(UserService);
    configService = mockedModule.get<ConfigService>(ConfigService);
    redis = mockedModule.get<IORedis>(REDIS_PROVIDER);
  });

  it('/userLinks (GET)', () => {
    jest.spyOn(redis, 'get').mockResolvedValueOnce(mockedLink);
    jest.spyOn(redis, 'get').mockResolvedValueOnce(mockedRedirects);

    return request(app.getHttpServer())
      .get('/userLinks')
      .expect(200)
      .expect([
        {
          shortLink: `http://${configService.host}:${configService.port}/${mockUser.shortLinks}`,
          link: mockedLink,
          redirectCount: mockedRedirects,
        },
      ] as UserLinksInterface[]);
  });

  it('/link (PUT)', () => {
    jest.spyOn(nanoid, 'nanoid').mockReturnValueOnce(mockUser.shortLinks);

    return request(app.getHttpServer())
      .put('/link')
      .send({ link: mockedLink } as GetShortLinkRequestDto)
      .set('host', `${configService.host}:${configService.port}`)
      .expect(200)
      .expect({
        shortLink: `http://${configService.host}:${configService.port}/${mockUser.shortLinks}`,
      } as GetShortLinkResponseDto);
  });

  it(':shortLink (GET)', () => {
    jest.spyOn(redis, 'get').mockResolvedValueOnce(mockedLink);

    return request(app.getHttpServer())
      .get('/' + mockUser.shortLinks)
      .expect(302)
      .expect((res) => expect(res.headers.location).toEqual(mockedLink));
  });
});
