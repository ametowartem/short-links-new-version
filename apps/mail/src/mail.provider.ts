import { Provider } from '@nestjs/common';
import * as FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { ConfigService } from '@nestjs/config';

export const MAILGUN_PROVIDER = Symbol('MAILGUN_PROVIDER');

export const appProviders = [
  {
    provide: MAILGUN_PROVIDER,
    useFactory: (configService: ConfigService) => {
      const mailgun = new Mailgun(FormData);

      return mailgun.client({
        username: 'api',
        key: configService.get<string>('MAILGUN_API_KEY'),
      });
    },

    inject: [ConfigService],
  },
] as Provider[];
