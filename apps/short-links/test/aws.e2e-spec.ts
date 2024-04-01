import { User } from '../src/user/schema/user.schema';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { AwsModule } from '../src/aws/aws.module';
import { ConfigService } from '../src/core/service/config.service';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { getModelToken } from '@nestjs/mongoose';
import { RmqService } from '@app/common';
import { AuthGuard } from '../src/auth/guard/auth.guard';
import { S3_PROVIDER } from '../src/aws/aws.provider';
import { S3Client } from '@aws-sdk/client-s3';

const mockUser: User = {
  _id: '65ca3d4e77df6f150f60f927',
  username: 'admin',
  password: '$2b$10$wZHmwKt7EPo5pnMerVTyPucRf6zFqGXLZkwEHj7fwJupVkbULHd5u',
  avatarPath:
    '106e33bb-4cc6-4958-b556-ac8a1a86cbaa-579a0c4a-abe5-4104-b263-742605bb92a1-Untitled_logo_1_free-file.jpg',
  mail: 'ametowartem@gmail.com',
  shortLinks: 'liba-dlya-minio',
};

const buffer = Buffer.from('some data');

const fileMock = {
  fieldname: 'file',
  originalname: 'avatar.jpg',
  buffer: buffer,
};

const mockedLink = 'https://mockedlink.com';
const mockedRedirects = '5';

describe('Aws', () => {
  let app: INestApplication;
  let s3: S3Client;

  const mockedService = {
    send: jest.fn(),
  };

  beforeAll(async () => {
    const mockedModule = await Test.createTestingModule({
      imports: [AwsModule],
      providers: [ConfigService],
    })
      .overrideProvider('MAILING')
      .useValue(mockedService)
      .overrideProvider(getModelToken(User.name))
      .useValue(mockedService)
      .overrideProvider(RmqService)
      .useValue(mockedService)
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = { id: mockUser._id };
          return true;
        },
      })
      .overrideProvider(S3_PROVIDER)
      .useValue(mockedService)
      .compile();

    app = mockedModule.createNestApplication();
    await app.init();

    s3 = mockedModule.get<S3Client>(S3_PROVIDER);
  });

  it('/file/get (GET)', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(s3, 'send').mockResolvedValueOnce({
      Body: { transformToByteArray: () => new Uint8Array(fileMock.buffer) },
    });

    return request(app.getHttpServer())
      .get(`/file/get/${fileMock.originalname}`)
      .expect(200)
      .expect(fileMock.buffer);
  });

  it('/file/upload (POST)', async () => {
    return request(app.getHttpServer())
      .post('/file/upload')
      .attach('file', fileMock.buffer, fileMock.originalname)
      .expect(201)
      .expect({});
  });
});
