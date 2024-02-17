import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth/auth.module';
import { LinkModule } from './link/link.module';
import { ConfigService } from './core/service/config.service';
import { CoreModule } from './core/core.module';
import { FileModule } from './file/file.module';
import { UserHttpModule } from './user/user-http.module';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { NestMinioModule } from 'nestjs-minio';
@Module({
  imports: [
    AuthModule,
    HttpModule,
    UserHttpModule,
    LinkModule,
    CoreModule,
    FileModule,
    // UserModule,
    MongooseModule.forRootAsync({
      imports: [CoreModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.mongodbUri,
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      include: [UserHttpModule, AuthModule, LinkModule],
      playground: true,
      introspection: true,
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    // NestMinioModule.register(
    //   // isGlobal: true,
    //   {
    //     endPoint: 'localhost',
    //     port: 9000,
    //     useSSL: true,
    //     accessKey: 'minioadmin',
    //     secretKey: 'minioadmin',
    //     //   добавить в .env
    //   },
    // ),
  ],
})
export class AppModule {}
