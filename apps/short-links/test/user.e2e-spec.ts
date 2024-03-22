import { INestApplication } from '@nestjs/common';
import { User } from '../src/user/schema/user.schema';
import { ConfigService } from '../src/core/service/config.service';
import { RmqService } from '@app/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { CreateUserRequestDto } from '../src/user/dto/create-user.request.dto';
import { getModelToken } from '@nestjs/mongoose';
import { ChangeUserRequestDto } from '../src/user/dto/change-user.request.dto';
import { Model, Query } from 'mongoose';
import { AddMailRequestDto } from '../src/link/dto/add-mail.request.dto';
import { REDIS_PROVIDER } from '../src/link/provider/link.provider';
import { AwsService } from '../src/aws/service/aws.service';
import { UserModule } from '../src/user/user.module';
import { VerifyMailRequestDto } from '../src/user/dto/verify-mail.request.dto';
import IORedis from 'ioredis';

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

const fileMock = {
  fieldname: 'file',
  originalname: 'avatar.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 12345,
  buffer: Buffer.from([0x01, 0x02, 0x03]),
  stream: null,
  destination: '',
  filename: '',
  path: '',
};

describe('User', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  let jwtToken: string;
  let redis: IORedis;
  let awsService: AwsService;

  const mockedService = {
    findOneByUsername: jest.fn().mockResolvedValue(mockUser),
    signAsync: jest.fn().mockResolvedValue('mockedToken'),
    findOneById: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn(),
    findOne: jest.fn().mockResolvedValue(mockUser),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockUser),
    findOneAndUpdate: jest.fn().mockResolvedValue(mockUser),
    exec: jest.fn(),
    emit: jest.fn(),
    sadd: jest.fn(),
    sismember: jest.fn().mockResolvedValue(1),
    get: jest.fn(),
    set: jest.fn(),
    findById: jest.fn(),
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
    getFile: jest.fn(),
  };

  beforeAll(async () => {
    const mockedModule = await Test.createTestingModule({
      imports: [UserModule],
      providers: [ConfigService],
    })
      .overrideProvider('MAILING')
      .useValue(mockedService)
      .overrideProvider(getModelToken(User.name))
      .useValue(mockedService)
      .overrideProvider(RmqService)
      .useValue(mockedService)
      .overrideProvider(REDIS_PROVIDER)
      .useValue(mockedService)
      .overrideProvider(AwsService)
      .useValue(mockedService)
      .compile();

    app = mockedModule.createNestApplication();
    userModel = mockedModule.get<Model<User>>(getModelToken(User.name));
    redis = mockedModule.get<IORedis>(REDIS_PROVIDER);
    awsService = mockedModule.get<AwsService>(AwsService);

    await app.init();

    jest
      .spyOn(userModel, 'findOne')
      .mockReturnThis()
      .mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as unknown as Query<User, any>);

    const authResponse = await request(app.getHttpServer())
      .post('/auth')
      .send({ username: 'admin', password: 'admin' })
      .expect(201);

    const { accessToken } = authResponse.body;
    jwtToken = 'Bearer ' + accessToken;
  });

  it('/user/registry (POST)', () => {
    return request(app.getHttpServer())
      .post('/user/registry')
      .send({
        username: mockUser.username,
        password: mockUser.username,
      } as CreateUserRequestDto)
      .expect({})
      .expect(201);
  });

  it('/user/change (POST)', async () => {
    jest
      .spyOn(userModel, 'findByIdAndUpdate')
      .mockReturnThis()
      .mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as unknown as Query<User, any>);

    jest
      .spyOn(userModel, 'findOne')
      .mockReturnThis()
      .mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as unknown as Query<User, any>);

    return (
      request(app.getHttpServer())
        .post('/user/change')
        .set('Authorization', jwtToken)
        .send({
          mail: mockUser.mail,
        } as ChangeUserRequestDto)
        // .expect('Content-Type', /json/)
        .expect(mockUser)
        .expect(201)
    );
  });

  it('/user/mail (POST)', async () => {
    return request(app.getHttpServer())
      .post('/user/mail')
      .set('Authorization', jwtToken)
      .send({ mail: mockUser.mail } as AddMailRequestDto)
      .expect(201)
      .expect({});
  });

  it('/user/verify (POST)', () => {
    jest
      .spyOn(userModel, 'findByIdAndUpdate')
      .mockReturnThis()
      .mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as unknown as Query<User, any>);

    jest.spyOn(redis, 'get').mockResolvedValueOnce('123');

    return request(app.getHttpServer())
      .post('/user/verify')
      .set('Authorization', jwtToken)
      .send({
        mail: mockUser.mail,
        verificationCode: '123',
      } as VerifyMailRequestDto)
      .expect(201)
      .expect(mockUser);
  });

  it('/user/upload-avatar (POST)', () => {
    jest
      .spyOn(userModel, 'findOneAndUpdate')
      .mockReturnThis()
      .mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as unknown as Query<User, any>);

    jest
      .spyOn(userModel, 'findById')
      .mockReturnThis()
      .mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as unknown as Query<User, any>);

    jest
      .spyOn(awsService, 'uploadFile')
      .mockResolvedValueOnce(fileMock.originalname);

    return (
      request(app.getHttpServer())
        .post('/user/upload-avatar')
        .set('Authorization', jwtToken)
        .attach('file', fileMock.buffer, fileMock.originalname)
        // .send({ file: fileMock })
        // .send({ _id: mockUser._id, file: fileMock } as IUploadFile)
        .expect(201)
        .expect({})
    );
  });

  it('/user/avatar (GET)', () => {
    jest
      .spyOn(userModel, 'findById')
      .mockReturnThis()
      .mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as unknown as Query<User, any>);

    jest.spyOn(awsService, 'getFile').mockResolvedValueOnce(fileMock.buffer);

    return request(app.getHttpServer())
      .get('/user/avatar')
      .set('Authorization', jwtToken)
      .expect(200)
      .expect(fileMock.buffer);
  });
});
