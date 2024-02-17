import { Module } from '@nestjs/common';
import { UserModule } from './user.module';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './controller/user.controller';
import { CoreModule } from '../core/core.module';
import {UserResolver} from './resolver/user.resolver';

@Module({
  imports: [UserModule, AuthModule, CoreModule],
  controllers: [UserController],
  providers: [UserResolver],
})
export class UserHttpModule {}
