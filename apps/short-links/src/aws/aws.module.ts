import { forwardRef, Module } from '@nestjs/common';
import { AwsService } from './service/aws.service';
import { CoreModule } from '../core/core.module';
import { AuthModule } from '../auth/auth.module';
import { AwsController } from './controller/aws.controller';
import { awsProviders } from './aws.provider';

@Module({
  imports: [CoreModule, forwardRef(() => AuthModule)],
  providers: [AwsService, ...awsProviders],
  controllers: [AwsController],
  exports: [AwsService],
})
export class AwsModule {}
