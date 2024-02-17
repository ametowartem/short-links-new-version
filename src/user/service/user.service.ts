import {
  BadRequestException,
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
import { Model, Types } from 'mongoose';
import { IAddAvatar } from '../interface/add-avatar.interface';
import { v4 as uuidv4 } from 'uuid';
import { InjectMinio } from 'nestjs-minio';
import { Client } from 'minio';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectMinio() private readonly minioClient: Client,
  ) {}

  async findAll() {
    return this.userModel.find().exec();
  }
  async findOneById(_id: Types.ObjectId) {
    return this.userModel.findById(_id).exec();
  }
  async findOneByUsername(username: string) {
    return this.userModel.findOne({ username: username }).exec();
  }
  async remove(id: string) {
    await this.userModel.findByIdAndDelete(id).exec();
  }
  async add(user: User) {
    return await this.userModel.create(user);
  }

  async changeUser(dto: IChangeUser, _id: Types.ObjectId) {
    const tmp: Partial<User> = {
      username: dto.username ? dto.username : undefined,
      password: dto.password
        ? await bcrypt.hash(dto.password, this.configService.saltRounds)
        : undefined,
      mail: dto.mail ? dto.mail : undefined,
    };
    try {
      return await this.userModel.findByIdAndUpdate(_id, tmp).exec();
    } catch (e) {
      if (e.code === 11000) {
        throw new BadRequestException('This username already exists');
      }

      throw new InternalServerErrorException();
    }
  }

  async addShortLink(dto: IAddShortlink) {
    const user = await this.userModel.findById(dto._id).exec();
    await this.userModel
      .findByIdAndUpdate(dto._id, {
        shortLinks: user.shortLinks
          ? dto.shortLink.concat(',', user.shortLinks)
          : dto.shortLink,
      })
      .exec();
  }

  async addAvatar(dto: IAddAvatar) {
    const fileName = `${uuidv4()}-${dto.file.originalname}`;

    await this.minioClient.putObject(
      'short-links',
      fileName,
      dto.file.buffer,
      // (err, etag) => {
      //   console.log(etag);
      // },
    );

    if (dto.user.avatarPath) {
      await this.minioClient.removeObjects('short-links', [
        dto.user.avatarPath,
      ]);
    }

    await this.userModel
      .findOneAndUpdate(dto.user._id, {
        avatarPath: fileName,
      })
      .exec();
  }

  async registry(userDto: CreateUserInterface) {
    const hash = await bcrypt.hash(
      userDto.password,
      this.configService.saltRounds,
    );
    const user = new this.userModel({
      username: userDto.username,
      password: hash,
      mail: userDto?.mail,
    });

    try {
      return await this.add(user);
    } catch (e) {
      if (e.code === 11000) {
        throw new BadRequestException('User already exists');
      }
      throw new InternalServerErrorException();
    }
  }

  async getUserAvatar(_id: Types.ObjectId) {
    const user = await this.findOneById(_id);
    if (!user.avatarPath) throw new NotFoundException();

    return await this.minioClient.getObject(
      'short-links',
      user.avatarPath,
      // (err, etag) => {
      //   console.log(etag);
      // },
    );
  }
}
