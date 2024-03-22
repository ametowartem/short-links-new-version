import { NestFactory } from '@nestjs/core';
import { MailModule } from './mail.module';
import { RmqService } from '@app/common';
import * as process from 'process';

async function bootstrap() {
  const app = await NestFactory.create(MailModule);
  const rmqService: RmqService = app.get<RmqService>(RmqService);

  app.connectMicroservice(rmqService.getOptions(process.env.MAIL_MICROSERVICE));

  await app.startAllMicroservices();
}
bootstrap();
