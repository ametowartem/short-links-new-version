import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthModule } from '../src/auth/auth.module';
import { User } from '../src/user/schema/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '../src/core/service/config.service';
import { RmqService } from '@app/common';
import { UserService } from '../src/user/service/user.service';
import { UserPayloadResponseDto } from '../src/auth/dto/user-payload.response.dto';
import { REDIS_PROVIDER } from '../src/link/provider/link.provider';

const mockUser: User = {
  _id: '65ca3d4e77df6f150f60f927',
  username: 'admin',
  password: '$2b$10$wZHmwKt7EPo5pnMerVTyPucRf6zFqGXLZkwEHj7fwJupVkbULHd5u',
  avatarPath:
    '106e33bb-4cc6-4958-b556-ac8a1a86cbaa-579a0c4a-abe5-4104-b263-742605bb92a1-Untitled_logo_1_free-file.jpg',
  mail: 'ametowartem@gmail.com',
  shortLinks:
    'liba-dlya-minio,DblsFR,tvH53m,dtrkjA,u4BVZS,72DxlI,rCJ00C,linay-rush',
};

describe('Auth', () => {
  let app: INestApplication;

  const mockedService = {
    findOneByUsername: jest.fn().mockResolvedValue(mockUser),
    signAsync: jest.fn().mockResolvedValue('mockedToken'),
    findOneById: jest.fn().mockResolvedValue(mockUser),
    sadd: jest.fn(),
    srem: jest.fn(),
    sismember: jest.fn().mockResolvedValue(1),
  };

  beforeAll(async () => {
    const mockedModule: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      providers: [ConfigService],
    })
      .overrideProvider('MAILING')
      .useValue(mockedService)
      .overrideProvider(getModelToken(User.name))
      .useValue(mockedService)
      // .overrideProvider(ConfigService)
      // .useValue(mockedService)
      .overrideProvider(RmqService)
      .useValue(mockedService)
      .overrideProvider(UserService)
      .useValue(mockedService)
      .overrideProvider(REDIS_PROVIDER)
      .useValue(mockedService)
      .compile();

    app = mockedModule.createNestApplication();
    await app.init();
  });

  it('/auth (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth')
      .send({ username: 'admin', password: 'admin' })
      .expect('Content-Type', /json/)
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toEqual(expect.any(String));
      });
  });

  it('/auth/profile (GET)', async () => {
    const authResponse = await request(app.getHttpServer())
      .post('/auth')
      .send({ username: 'admin', password: 'admin' })
      .expect(201);

    const { accessToken } = authResponse.body;

    return request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect('Content-Type', /json/)
      .expect(200)
      .expect({
        username: mockUser.username,
        mail: mockUser.mail,
      } as UserPayloadResponseDto);
  });

  it('/auth/logout (PUT)', async () => {
    const authResponse = await request(app.getHttpServer())
      .post('/auth')
      .send({ username: 'admin', password: 'admin' })
      .expect(201);

    const { accessToken } = authResponse.body;

    return request(app.getHttpServer())
      .put('/auth/logout')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect({})
      .expect(200);
  });
});
