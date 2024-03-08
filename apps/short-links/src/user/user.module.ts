import { Module } from '@nestjs/common';
// import { UserEntity } from './entity/user.entity';
import { UserService } from './service/user.service';
// import { UserRepository } from './repository/user.repository';
import { CoreModule } from '../core/core.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { RmqModule } from '@app/common';
import { appProviders } from '../link/provider/link.provider';
@Module({
  imports: [
    // TypeOrmModule.forFeature([UserEntity]),
    CoreModule,
    RmqModule.register({ name: 'MAILING' }),

    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    UserService,
    ...appProviders,
    // UserRepository
  ],
  exports: [UserService],
})
export class UserModule {}
