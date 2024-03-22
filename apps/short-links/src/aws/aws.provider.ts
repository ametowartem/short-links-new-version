import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '../core/service/config.service';
import { Provider } from '@nestjs/common';

export const S3_PROVIDER = Symbol('S3_PROVIDER');

export const awsProviders = [
  {
    provide: S3_PROVIDER,
    useFactory: (configService: ConfigService) =>
      new S3Client({
        credentials: {
          secretAccessKey: configService.minioSecretKey,
          accessKeyId: configService.minioAccessKey,
        },
        endpoint: `http://${configService.minioHost}:${configService.minioPort}`,
        forcePathStyle: true,

        region: 'ru',
      }),
    inject: [ConfigService],
  },
] as Provider[];
