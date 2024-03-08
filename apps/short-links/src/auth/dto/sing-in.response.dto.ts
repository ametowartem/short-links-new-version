import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty } from 'class-validator';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SingInResponseDto {
  constructor(data: Required<SingInResponseDto>) {
    Object.assign(this, data);
  }

  @Field(() => String)
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoyLCJqdGkiOiI2M2EwM2E1OS0xYTFjLTQzMmYtOTc4Mi1iNjg1NDYwMWIxOGYiLCJleHQiOjE2ODk3NzY1MzQsImlhdCI6MTY4OTE3MTczNH0.XFOuWYQe3d6nzMHGTIsMhgsK8ylHxn4gDa9azYWlbI4',
  })
  @IsNotEmpty()
  @IsJWT()
  accessToken: string;
}
