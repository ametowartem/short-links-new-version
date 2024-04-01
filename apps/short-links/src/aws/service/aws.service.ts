import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '../../core/service/config.service';
import { IUploadFile } from '../../user/interface/add-avatar.interface';
import { v4 as uuidv4 } from 'uuid';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { S3_PROVIDER } from '../aws.provider';

@Injectable()
export class AwsService {
  @Inject(S3_PROVIDER)
  s3: S3Client;

  constructor(private readonly configService: ConfigService) {}

  bucketName = this.configService.minioBucketName;

  // s3 = new S3Client({
  //   credentials: {
  //     secretAccessKey: this.configService.minioSecretKey,
  //     accessKeyId: this.configService.minioAccessKey,
  //   },
  //   endpoint: this.endpoint,
  //   forcePathStyle: true,
  //
  //   region: 'ru',
  // });

  async uploadFile(dto: IUploadFile): Promise<string> {
    const fileName = this.createUniqueFileName(dto.file.originalname);

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
          Body: dto.file.buffer,
        }),
      );
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }

    return fileName;
  }

  async deleteFile(filepath: string) {
    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: filepath,
        }),
      );
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  createUniqueFileName(originalName: string): string {
    return `${uuidv4()}-${originalName}`;
  }

  async getFile(fileName: string): Promise<Uint8Array> {
    try {
      const file = await this.s3.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
        }),
      );
      return file.Body.transformToByteArray();
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
