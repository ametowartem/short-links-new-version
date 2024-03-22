import { Injectable } from '@nestjs/common';
import { EnvConfigConst } from '../const/envConfig.const';
import { JoiSchema } from '../const/envConfigSchema.const';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfigConst;

  constructor() {
    dotenv.config();
    this.envConfig = this.validateInput(process.env);
  }

  private validateInput(config: EnvConfigConst): EnvConfigConst {
    const { error, value: validatedEnvConfig } = JoiSchema.validate(config, {
      allowUnknown: true,
    });

    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    return validatedEnvConfig;
  }

  get redisPort(): number {
    return Number(this.envConfig.REDIS_PORT);
  }
  get redisHost(): string {
    return String(this.envConfig.REDIS_HOST);
  }
  get databaseType(): string {
    return String(this.envConfig.DATABASE_TYPE);
  }
  get host(): string {
    return String(this.envConfig.HOST);
  }
  get port(): number {
    return Number(this.envConfig.PORT);
  }
  get databasePort(): number {
    return Number(this.envConfig.DATABASE_PORT);
  }
  get databaseUsername(): string {
    return String(this.envConfig.DATABASE_USERNAME);
  }
  get databasePassword(): string {
    return String(this.envConfig.DATABASE_PASSWORD);
  }
  get databaseName(): string {
    return String(this.envConfig.DATABASE_NAME);
  }
  get databaseHost(): string {
    return String(this.envConfig.DATABASE_HOST);
  }
  get jwtSecret(): string {
    return String(this.envConfig.SECRET);
  }
  get ext(): number {
    return Number(this.envConfig.EXT);
  }
  get saltRounds(): number {
    return Number(this.envConfig.SALT_ROUNDS);
  }
  get mongodbUri(): string {
    return String(this.envConfig.MONGODB_URI);
  }
  get mailMicroservice(): string {
    return String(this.envConfig.MAIL_MICROSERVICE);
  }
  get minioAccessKey(): string {
    return String(this.envConfig.MINIO_ACCESS_KEY);
  }
  get minioSecretKey(): string {
    return String(this.envConfig.MINIO_SECRET_KEY);
  }
  get minioHost(): string {
    return String(this.envConfig.MINIO_HOST);
  }
  get minioBucketName(): string {
    return String(this.envConfig.MINIO_BUCKET_NAME);
  }
  get minioPort(): number {
    return Number(this.envConfig.MINIO_PORT);
  }
}
