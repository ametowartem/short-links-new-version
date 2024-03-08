import { Cron, CronExpression } from '@nestjs/schedule';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { MAILGUN_PROVIDER } from '../mail.provider';
// import { MailService } from '../service/mail.service';
import { MessageStatus } from '../const/message.status.enum';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../service/mail.service';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from '../schema/message.schema';
import { Model } from 'mongoose';

@Injectable()
export class MailCronJob {
  private readonly logger = new Logger(MailCronJob.name);

  @Inject(MAILGUN_PROVIDER)
  private readonly client;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService, // @InjectModel(Message.name) private MessageModel: Model<Message>,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkMessage() {
    this.logger.debug('Called every minute');
    const exact_date = new Date(new Date().setSeconds(0));
    const messages = await this.mailService.findMessagesByTimeSending(
      exact_date,
    );

    messages.forEach((message: Message) => {
      const messageData = {
        from:
          message.sender ||
          `mailgun@${this.configService.get<string>('MAILGUN_DOMAIN')}`,
        to: message.recipient,
        subject: message.subject,
        text: message.message,
      };

      this.client.messages
        .create(this.configService.get<string>('MAILGUN_DOMAIN'), messageData)
        .then((res) => {
          this.logger.log(res);
          this.mailService.setStatus(message._id, MessageStatus.Send);
        })
        .catch((err) => {
          this.logger.error(err);
          this.mailService.setStatus(
            message._id,
            MessageStatus.Error,
            err.message,
          );
        });
    });
  }
}
