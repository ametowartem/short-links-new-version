import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/service/user.service';
import { ConfigService } from '../../core/service/config.service';
import { AuthService } from '../service/auth.service';
import { REDIS_PROVIDER } from '../../link/provider/link.provider';
import { UserModule } from '../../user/user.module';
import { CoreModule } from '../../core/core.module';
import { TestBed } from '@automock/jest';
import IORedis from 'ioredis';
import { User } from '../../user/schema/user.schema';
import * as bcrypt from 'bcrypt';
import { ISignInResponse } from '../interface/sign-in.response.interface';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let redis: IORedis;
  let jwtService: JwtService;
  let userService: UserService;
  let configService: ConfigService;

  const mockUser: User = {
    _id: '65ca3d4e77df6f150f60f927',
    username: 'admin',
    password: '$2b$10$wZHmwKt7EPo5pnMerVTyPucRf6zFqGXLZkwEHj7fwJupVkbULHd5u',
    avatarPath:
      '106e33bb-4cc6-4958-b556-ac8a1a86cbaa-579a0c4a-abe5-4104-b263-742605bb92a1-Untitled_logo_1_free-file.jpg',
    mail: 'ametowartem@gmail.com',
    shortLinks: 'linay-rush',
  };

  beforeAll(() => {
    const { unit, unitRef } = TestBed.create(AuthService).compile();

    authService = unit;
    redis = unitRef.get(REDIS_PROVIDER);
    jwtService = unitRef.get(JwtService);
    userService = unitRef.get(UserService);
    configService = unitRef.get(ConfigService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('singIn', () => {
    const mockedToken = 'mockedToken';
    it('should authorize user and return access token', async () => {
      jest
        .spyOn(userService, 'findOneByUsername')
        .mockResolvedValueOnce(mockUser);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce(mockedToken);

      const result = await authService.signIn({
        username: mockUser.username,
        password: 'admin',
      });

      const userTokenWhiteList = authService.getUserTokenWhiteList(
        mockUser._id,
      );

      expect(redis.sadd).toHaveBeenCalledWith(
        userTokenWhiteList,
        expect.any(String),
      );

      expect(result).toEqual({
        accessToken: expect.any(String),
      } as ISignInResponse);
    });

    it('should throw unauthorized exception', async () => {
      jest
        .spyOn(userService, 'findOneByUsername')
        .mockResolvedValueOnce(mockUser);

      await expect(
        authService.signIn({ username: mockUser.username, password: '123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
