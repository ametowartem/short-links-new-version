import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from '../service/auth.service';
import { UserService } from '../../user/service/user.service';
import { SingInResponseDto } from '../dto/sing-in.response.dto';
import { SingInRequestDto } from '../dto/sing-in.request.dto';
import { UserPayloadResponseDto } from '../dto/user-payload.response.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guard/gql-auth.guard';
import { GqlUserId } from '../../user/decorator/gql-user-id.decorator';
import { ISignIn } from '../interface/sign-in.interface';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Mutation(() => SingInResponseDto)
  async signIn(
    @Args('body') dto: SingInRequestDto,
  ): Promise<SingInResponseDto> {
    return await this.authService.signIn({
      username: dto.username,
      password: dto.password,
    } as ISignIn);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => UserPayloadResponseDto)
  async getProfile(@GqlUserId() _id: string) {
    const user = await this.userService.findOneById(_id);
    return new UserPayloadResponseDto({
      username: user.username,
      mail: user?.mail,
    });
  }
}
