import { Module } from '@nestjs/common';
import { FileController } from './controller/file.controller';
import { AuthModule } from '../auth/auth.module';
import { CoreModule } from '../core/core.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [AuthModule, CoreModule, UserModule],
  controllers: [FileController],
})
export class FileModule {}
