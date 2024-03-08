import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { appProviders } from '../link/provider/link.provider';
import { CoreModule } from '../core/core.module';
import { ConfigService } from '../core/service/config.service';
import { AuthResolver } from './resolver/auth.resolver';
@Module({
  imports: [
    UserModule,
    CoreModule,
    JwtModule.registerAsync({
      imports: [CoreModule],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.jwtSecret,
        signOptions: { expiresIn: '60s' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, ...appProviders, AuthResolver],
  exports: [AuthService, JwtService],
})
export class AuthModule {}
