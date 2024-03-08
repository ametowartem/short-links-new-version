import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RmqModule } from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schema/message.schema';
import { MailService } from './service/mail.service';
import { appProviders } from './mail.provider';
import { MailControllerV1 } from './controller/mail.controller.v1';

@Module({
  imports: [
    RmqModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RABBITMQ_URI: Joi.string().required(),
        RABBITMQ_MAILING_QUEUE: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  providers: [MailService, ...appProviders],
  controllers: [MailControllerV1],
  // controllers: [MailControllerV1],
  // providers: [, ...appProviders, MailCronJob, ],
})
export class MailModule {}
