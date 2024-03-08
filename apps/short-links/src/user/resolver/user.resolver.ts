import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from '../schema/user.schema';
import { UserService } from '../service/user.service';
import { CreateUserRequestDto } from '../dto/create-user.request.dto';
import { ChangeUserRequestDto } from '../dto/change-user.request.dto';
import { UseGuards } from '@nestjs/common';
import { GqlUserId } from '../decorator/gql-user-id.decorator';
import { GqlAuthGuard } from '../../auth/guard/gql-auth.guard';
import { FindUserByIdRequestDto } from '../dto/find-user-by-id.request.dto';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  async registry(@Args('body') body: CreateUserRequestDto) {
    return await this.userService.registry({
      username: body.username,
      password: body.password,
      mail: body?.mail,
    });
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User)
  async changeUser(
    @Args('body') body: ChangeUserRequestDto,
    @GqlUserId() _id: string,
  ) {
    return await this.userService.changeUser(body, _id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [User], { name: 'users' })
  async findAll() {
    return await this.userService.findAll();
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User)
  async findOne(@Args('body') dto: FindUserByIdRequestDto) {
    return await this.userService.findOneById(dto._id);
  }
}
