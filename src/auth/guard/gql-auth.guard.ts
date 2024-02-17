import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../service/auth.service';
import { ConfigService } from '../../core/service/config.service';
import { PayloadInterface } from '../interface/payload.interface';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = GqlExecutionContext.create(context);
    const ctx = request.getContext().req;
    const token = this.extractTokenFromHeader(ctx);

    if (!token) {
      throw new UnauthorizedException();
    }

    let result: boolean;

    try {
      const payload: PayloadInterface = await this.jwtService.verifyAsync(
        token,
        {
          secret: this.configService.jwtSecret,
        },
      );

      ctx.user = payload;

      result = await this.authService.checkRedisIsMember(payload);
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }

    if (!result) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const headers = request.headers as { authorization?: string };

    const [type, token] = headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
