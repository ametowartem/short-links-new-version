import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { MailService } from '../service/mail.service';
import { IAddMail, RmqService } from '@app/common';

@Controller('v1/mail')
export class MailControllerV1 {
  constructor(
    private readonly mailService: MailService,
    private readonly rmqService: RmqService,
  ) {}

  // @Post()
  // @ApiResponse({
  //   status: HttpStatus.OK,
  // })
  // async sendMail(@Body() body: GetMailParamsDto) {
  //   await this.mailService.sendMessage(body);
  // }

  @EventPattern('mail')
  async verifyMail(@Payload() dto, @Ctx() ctx: RmqContext) {
    const body: IAddMail = dto.dto;
    await this.mailService.verifyMail(body);
    this.rmqService.ack(ctx);
  }
}
