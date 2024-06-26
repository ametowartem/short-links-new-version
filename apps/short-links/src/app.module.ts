import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth/auth.module';
import { LinkModule } from './link/link.module';
import { ConfigService } from './core/service/config.service';
import { CoreModule } from './core/core.module';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import * as process from 'process';
import { AwsModule } from './aws/aws.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AuthModule,
    HttpModule,
    UserModule,
    // UserHttpModule,
    CoreModule,
    AwsModule,
    // UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MAIL_MICROSERVICE: Joi.string().required(),
        MINIO_ACCESS_KEY: Joi.string().required(),
        MINIO_SECRET_KEY: Joi.string().required(),
        MINIO_HOST: Joi.string().required(),
        MINIO_PORT: Joi.number().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [CoreModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.mongodbUri,
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot({
      // include: [UserHttpModule, AuthModule, LinkModule],
      path: '/api/graphql',
      playground: true,
      introspection: true,
      debug: true,
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    LinkModule,
    // NestMinioModule.register(
    //   // isGlobal: true,
    //   {
    //     isGlobal: true,
    //     endPoint: process.env.MINIO_HOST,
    //     port: +process.env.MINIO_PORT,
    //     useSSL: false,
    //     accessKey: process.env.MINIO_ACCESS_KEY,
    //     secretKey: process.env.MINIO_SECRET_KEY,
    //   },
    // ),
  ],
})
export class AppModule {}
