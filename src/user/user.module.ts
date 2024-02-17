import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { UserEntity } from './entity/user.entity';
import { UserService } from './service/user.service';
// import { UserRepository } from './repository/user.repository';
import { CoreModule } from '../core/core.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import {UserResolver} from './resolver/user.resolver';
@Module({
  imports: [
    // TypeOrmModule.forFeature([UserEntity]),
    CoreModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    UserService,
    // UserRepository
  ],
  exports: [UserService],
})
export class UserModule {}
