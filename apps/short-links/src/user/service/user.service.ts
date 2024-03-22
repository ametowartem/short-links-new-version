import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserInterface } from '../interface/create-user.interface';
import { ConfigService } from '../../core/service/config.service';
import { IAddShortlink } from '../interface/add-shortlink.interface';
import { IChangeUser } from '../interface/change-user.interface';
import { User } from '../schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUploadFile } from '../interface/add-avatar.interface';
import { ClientProxy } from '@nestjs/microservices';
import { IAddMail } from '@app/common';
import { REDIS_PROVIDER } from '../../link/provider/link.provider';
import IORedis from 'ioredis';
import { IVerifyMail } from '../interface/verify-mail.interface';
import { nanoid } from 'nanoid/non-secure';
import { AwsService } from '../../aws/service/aws.service';

@Injectable()
export class UserService {
  @Inject(REDIS_PROVIDER)
  private readonly redis: IORedis;

  constructor(
    private readonly configService: ConfigService,
    private readonly awsService: AwsService,
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject('MAILING')
    private mailingClient: ClientProxy,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }
  async findOneById(_id: string): Promise<User> {
    return this.userModel.findById(_id).exec();
  }
  async findOneByUsername(username: string): Promise<User> {
    return this.userModel.findOne({ username: username }).exec();
  }
  async remove(id: string): Promise<User> {
    return await this.userModel.findByIdAndDelete(id).exec();
  }

  async registry(userDto: CreateUserInterface): Promise<User> {
    const hash = await bcrypt.hash(
      userDto.password,
      this.configService.saltRounds,
    );

    const user: User = {
      username: userDto.username,
      password: hash,
      mail: userDto?.mail,
    };

    try {
      return await this.userModel.create(user);
    } catch (e) {
      if (e.code === 11000) {
        throw new BadRequestException('User already exists');
      }
      throw new InternalServerErrorException();
    }
  }

  async changeUser(dto: IChangeUser, _id: string): Promise<User> {
    const tmp: Partial<User> = {
      username: dto.username ? dto.username : undefined,
      password: dto.password
        ? await bcrypt.hash(dto.password, this.configService.saltRounds)
        : undefined,
      mail: dto.mail ? dto.mail : undefined,
    };
    try {
      return await this.userModel
        .findByIdAndUpdate(_id, tmp, {
          new: true,
        })
        .exec();
    } catch (e) {
      if (e.code === 11000) {
        throw new BadRequestException('This username already exists');
      }

      throw new InternalServerErrorException();
    }
  }
  //
  // async addShortLink(dto: IAddShortlink): Promise<User> {
  //   const user = await this.userModel.findById(dto._id).exec();
  //   return await this.userModel
  //     .findByIdAndUpdate(dto._id, {
  //       shortLinks: user.shortLinks
  //         ? dto.shortLink.concat(',', user.shortLinks)
  //         : dto.shortLink,
  //     })
  //     .exec();
  // }
  async addShortLink(dto: IAddShortlink): Promise<User> {
    return await this.userModel
      .findOneAndUpdate({ _id: dto._id }, [
        {
          $set: {
            shortLinks: { $concat: ['$shortLinks', ',', dto.shortLink] },
          },
        },
      ])
      .exec();
  }

  async addAvatar(dto: IUploadFile): Promise<User> {
    const user = await this.findOneById(dto._id);

    const fileName = await this.awsService.uploadFile(dto);

    if (user.avatarPath) {
      await this.awsService.deleteFile(user.avatarPath);
    }

    return await this.userModel
      .findOneAndUpdate(
        { _id: user._id },
        // dto.user._id,
        {
          avatarPath: fileName,
        },
        {
          new: true,
        },
      )
      .exec();
  }

  async getUserAvatar(_id: string) {
    const user = await this.findOneById(_id);
    if (!user.avatarPath) throw new NotFoundException();

    return await this.awsService.getFile(user.avatarPath);
  }

  async addMail(dto: IAddMail, _id: string): Promise<void> {
    const existsVerificationCode = await this.redis.get(
      this.getUserVerificationToken(_id),
    );

    if (existsVerificationCode) {
      dto.verificationCode = existsVerificationCode;
    } else {
      dto.verificationCode = nanoid(6);

      this.redis.set(
        this.getUserVerificationToken(_id),
        dto.verificationCode,
        'EX',
        60,
      );
    }

    this.mailingClient.emit('mail', { dto });
  }

  getUserVerificationToken(_id: string): string {
    return `user-verification-token:${_id}`;
  }

  async verifyMail(dto: IVerifyMail, _id: string): Promise<User> {
    const token = this.getUserVerificationToken(_id);

    await this.verifyToken(token, dto.verificationCode);

    return await this.changeUser({ mail: dto.mail }, _id);
  }

  async verifyToken(
    userToken: string,
    verificationCode: string,
  ): Promise<void> {
    const existsVerificationCode = await this.redis.get(userToken);

    if (!existsVerificationCode) {
      throw new NotFoundException('Error: verification code are not found');
    }

    if (existsVerificationCode.localeCompare(verificationCode)) {
      throw new BadRequestException('Error: verification code is not valid');
    }
  }
}
