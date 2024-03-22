import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { CoreModule } from '../core/core.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { appProviders } from '../link/provider/link.provider';
import { RmqModule } from '@app/common';
import { AwsModule } from '../aws/aws.module';
import { AuthModule } from '../auth/auth.module';
import { UserResolver } from './resolver/user.resolver';
import { UserController } from './controller/user.controller';

@Module({
  imports: [
    forwardRef(() => AwsModule),
    forwardRef(() => AuthModule),
    CoreModule,
    RmqModule.register({ name: 'MAILING' }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UserService, ...appProviders, UserResolver],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
