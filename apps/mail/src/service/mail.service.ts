import { Inject, Injectable, Logger } from '@nestjs/common';
import { GetMailParamsDto } from '../dto/get-mail.params.dto';
import { MAILGUN_PROVIDER } from '../mail.provider';
import { MessageStatus } from '../const/message.status.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from '../schema/message.schema';
import { Model } from 'mongoose';
import { IGetMailMessage } from '../interface/get-mail-message.interface';
import { IAddMail } from '@app/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  @Inject(MAILGUN_PROVIDER)
  private readonly client;

  constructor(
    @InjectModel(Message.name) private MessageModel: Model<Message>,
    private readonly configService: ConfigService,
  ) {}

  async verifyMail(dto: IAddMail) {
    const mailMessage = new this.MessageModel({
      sender: this.configService.get<string>('MAILGUN_SENDER'),
      recipient: dto.mail,
      subject: 'mail verification',
      message: dto.verificationCode,
      timeSending: new Date(),
    });

    console.log(mailMessage);

    const message = await this.add(mailMessage);

    await this.sendMessage(message);
  }

  async sendMessage(message: Message) {
    const messageData = {
      from:
        message.sender ||
        `mailgun@${this.configService.get<string>('MAILGUN_DOMAIN')}`,
      to: message.recipient,
      subject: message.subject,
      text: message.message,
    };

    console.log(message);

    this.client.messages
      .create(this.configService.get<string>('MAILGUN_DOMAIN'), messageData)
      .then((res) => {
        this.logger.log(res);
        this.setStatus(message._id, MessageStatus.Send);
      })
      .catch((err) => {
        this.logger.error(err);
        this.setStatus(message._id, MessageStatus.Error, err.message);
      });
  }

  // async sendMessage(dto: GetMailParamsDto) {
  //   const timeSending = new Date(
  //     dto.timeSending ? new Date(dto.timeSending).setSeconds(0) : undefined,
  //   );
  //
  //   const message = new this.MessageModel({
  //     sender: dto.sender,
  //     recipient: dto.recipient,
  //     subject: dto.subject,
  //     message: dto.message,
  //     timeSending: timeSending,
  //   });
  //
  //   await this.add(message);
  // }

  async add(message: Message) {
    return await this.MessageModel.create(message);
  }

  async delete(id: string) {
    await this.MessageModel.findByIdAndDelete(id);
  }

  async findMessagesByTimeSending(timeSending: Date) {
    try {
      return await this.MessageModel.find({
        time_sending: { $lte: timeSending },
        status: MessageStatus.Pending,
      });
    } catch (error) {
      console.error('Error finding messages by time sending:', error);
      throw error;
    }
  }

  findAll() {
    return this.MessageModel.find();
  }

  async setStatus(id: string, status: MessageStatus, errorMessage?: string) {
    try {
      return await this.MessageModel.findByIdAndUpdate(id, {
        status,
        errorMessage,
      });
    } catch (error) {
      console.error('Error setting status:', error);
      throw error;
    }
  }
}
