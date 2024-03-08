import { Provider } from '@nestjs/common';
import IORedis from 'ioredis';
import { ConfigService } from '../../core/service/config.service';

export const REDIS_PROVIDER = 'REDIS_PROVIDER';

export const appProviders = [
  {
    provide: REDIS_PROVIDER,
    useFactory: (configService: ConfigService) =>
      new IORedis({
        host: configService.redisHost,
        port: configService.redisPort,
      }),
    inject: [ConfigService],
  },
] as Provider[];
