import { Module } from '@nestjs/common';
import { LinkController } from './controller/link.controller';
import { LinkService } from './service/link.service';
import { appProviders } from './provider/link.provider';
import { CoreModule } from '../core/core.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import {LinkResolver} from './resolver/link.resolver';
@Module({
  imports: [CoreModule, AuthModule, UserModule],
  controllers: [LinkController],
  providers: [LinkService, ...appProviders, LinkResolver],
  exports: [LinkService],
})
export class LinkModule {}
