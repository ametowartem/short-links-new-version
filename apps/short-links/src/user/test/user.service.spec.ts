import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../service/user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { ConfigService } from '../../core/service/config.service';
import { Client } from 'minio';
import { MINIO_CONNECTION, NestMinioService } from 'nestjs-minio';
import { REDIS_PROVIDER } from '../../link/provider/link.provider';
import { Model, Query } from 'mongoose';
import IORedis from 'ioredis';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserInterface } from '../interface/create-user.interface';
import * as bcrypt from 'bcrypt';
import { IChangeUser } from '../interface/change-user.interface';
import { IAddShortlink } from '../interface/add-shortlink.interface';
import {
  BadRequestException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { IAddMail } from '@app/common';
import * as nanoid from 'nanoid/non-secure';

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

describe('UserService', () => {
  //   const mockUserService = jest.fn().mockReturnValue({
  //     findById: jest.fn().mockResolvedValue(mockUser),
  //   });

  const mockUserModel = {
    findById: jest.fn().mockResolvedValue(mockUser),
    findOne: jest.fn().mockResolvedValue(mockUser),
    findByIdAndDelete: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockResolvedValue(mockUser),
    find: jest.fn().mockResolvedValue([mockUser]),
    findByIdAndUpdate: jest.fn(),
    findOneAndUpdate: jest.fn(),
    exec: jest.fn(),
    lean: jest.fn(),
  };

  const mockUserService = {
    putObject: jest.fn(),
    getObject: jest.fn(),
    removeObjects: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    emit: jest.fn(),
  };
  let userService: UserService;
  let configService: ConfigService;
  let minioClient: Client;
  let mailingClient: ClientProxy;
  let redis: IORedis;
  let userModel: Model<User>;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: MINIO_CONNECTION,
          useValue: mockUserService,
        },
        {
          provide: 'MAILING',
          useValue: mockUserService,
        },
        {
          provide: REDIS_PROVIDER,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    minioClient = moduleRef.get<Client>(MINIO_CONNECTION);
    mailingClient = moduleRef.get<ClientProxy>('MAILING');
    redis = moduleRef.get<IORedis>(REDIS_PROVIDER);
    userModel = moduleRef.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findOneById', () => {
    it('should find and return user by ID', async () => {
      jest
        .spyOn(userModel, 'findById')
        .mockReturnThis()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(mockUser),
        } as unknown as Query<User, any>);

      const result = await userService.findOneById(mockUser._id);

      expect(userModel.findById).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      jest
        .spyOn(userModel, 'find')
        .mockReturnThis()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce([mockUser]),
        } as unknown as Query<User[], any>);

      const result = await userService.findAll();

      expect(userModel.find).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOneByUsername', () => {
    it('should find and return user by username', async () => {
      jest
        .spyOn(userModel, 'findOne')
        .mockReturnThis()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(mockUser),
        } as unknown as Query<User, any>);

      const result = await userService.findOneByUsername(mockUser.username);

      expect(userModel.findOne).toHaveBeenCalledWith({
        username: mockUser.username,
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('remove', () => {
    it('should find and delete user', async () => {
      jest
        .spyOn(userModel, 'findByIdAndDelete')
        .mockReturnThis()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(mockUser),
        } as unknown as Query<User, any>);

      const result = await userService.remove(mockUser._id);

      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('registry', () => {
    it('should create and return new user', async () => {
      jest.spyOn(userModel, 'create');

      const result = await userService.registry({
        username: mockUser.username,
        password: mockUser.password,
        mail: mockUser.mail,
      } as CreateUserInterface);

      expect(userModel.create).toHaveBeenCalled();
      expect(result).toBeDefined();

      expect(result).toEqual(mockUser);
    });
  });

  describe('changeUser', () => {
    it('should change and return user with option params', async () => {
      jest
        .spyOn(userModel, 'findByIdAndUpdate')
        .mockReturnThis()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(mockUser),
        } as unknown as Query<User, any>);

      const result = await userService.changeUser(
        { username: 'user' } as IChangeUser,
        mockUser._id,
      );

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser._id,
        { username: 'user' },
        { new: true },
      );
      expect(result).toBeDefined();
      expect(result).toEqual(mockUser);
    });
  });

  describe('addShortLink', () => {
    it('should find, update and return user with added short link as string', async () => {
      jest
        .spyOn(userModel, 'findOneAndUpdate')
        .mockReturnThis()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(mockUser),
        } as unknown as Query<User, any>);

      const result = await userService.addShortLink({
        _id: mockUser._id,
        shortLink: 'newShortLink',
      } as IAddShortlink);

      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockUser._id },
        [
          {
            $set: {
              shortLinks: { $concat: ['$shortLinks', ',', 'newShortLink'] },
            },
          },
        ],
      );

      expect(result).toBeDefined();
      expect(result).toEqual(mockUser);
    });
  });

  describe('addAvatar', () => {
    it('should put avatar image to AWS client and put path to avatar to user entity', async () => {
      jest
        .spyOn(userModel, 'findOneAndUpdate')
        .mockReturnThis()
        .mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(mockUser),
        } as unknown as Query<User, any>);

      jest.spyOn(userService, 'findOneById').mockResolvedValueOnce(mockUser);
      jest
        .spyOn(userService, 'createUniqueFileName')
        .mockReturnValue(fileMock.originalname);

      const result = await userService.addAvatar({
        _id: mockUser._id,
        file: fileMock,
      });

      expect(minioClient.putObject).toHaveBeenCalledWith(
        'short-links',
        fileMock.originalname,
        fileMock.buffer,
      );

      expect(minioClient.removeObjects).toHaveBeenCalledWith('short-links', [
        mockUser.avatarPath,
      ]);

      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockUser._id },
        { avatarPath: fileMock.originalname },
        { new: true },
      );

      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserAvatar', () => {
    it('should return user avatar image if exists', async () => {
      jest.spyOn(userService, 'findOneById').mockResolvedValueOnce(mockUser);

      jest.spyOn(minioClient, 'getObject').mockResolvedValue(fileMock.stream);

      const result = await userService.getUserAvatar(mockUser._id);

      expect(minioClient.getObject).toHaveBeenCalledWith(
        'short-links',
        mockUser.avatarPath,
      );
      expect(result).toEqual(fileMock.stream);
    });
  });

  describe('addMail', () => {
    it('should check if verification token exists and call mail microservice', async () => {
      jest.spyOn(redis, 'get').mockResolvedValueOnce('123');

      await userService.addMail({ mail: mockUser.mail }, mockUser._id);

      const dto = {
        mail: mockUser.mail,
        verificationCode: '123',
      } as IAddMail;

      expect(mailingClient.emit).toHaveBeenCalledWith('mail', { dto });
    });

    it('should create and set verification code then call mailing microservice', async () => {
      jest.spyOn(redis, 'get').mockResolvedValueOnce('');
      jest.spyOn(nanoid, 'nanoid').mockReturnValue('mockedCode');
      jest
        .spyOn(userService, 'getUserVerificationToken')
        .mockReturnValue('mockedToken');
      await userService.addMail({ mail: mockUser.mail }, mockUser._id);

      const dto = {
        mail: mockUser.mail,
        verificationCode: 'mockedCode',
      } as IAddMail;

      expect(redis.set).toHaveBeenCalledWith(
        'mockedToken',
        'mockedCode',
        'EX',
        60,
      );

      expect(mailingClient.emit).toHaveBeenCalledWith('mail', { dto });
    });
  });

  describe('verifyMail', () => {
    it('should add mail to user entity', async () => {
      jest.spyOn(userService, 'changeUser').mockResolvedValueOnce(mockUser);
      jest
        .spyOn(userService, 'getUserVerificationToken')
        .mockReturnValue('mockedToken');
      jest.spyOn(userService, 'verifyToken').mockReturnThis();

      const result = await userService.verifyMail(
        { mail: mockUser.mail, verificationCode: 'mockedCode' },
        mockUser._id,
      );

      expect(result).toEqual(mockUser);
    });
  });

  describe('verifyToken', () => {
    it('should find created verification code in redis and throw exception if not found or not equal', async () => {
      jest.spyOn(redis, 'get').mockResolvedValueOnce('mockedCode');
      await userService.verifyToken('mockedToken', 'mockedCode');

      expect(redis.get).toHaveBeenCalledWith('mockedToken');
    });

    it('should throw not found exception', async () => {
      await expect(
        userService.verifyToken('mockedToken', 'mockedCode'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw bad request exception', async () => {
      jest.spyOn(redis, 'get').mockResolvedValueOnce('wrongCode');

      await expect(
        userService.verifyToken('mockedToken', 'mockedCode'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
