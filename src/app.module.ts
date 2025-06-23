import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/validation';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60, limit: 10 }] }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      validationSchema: envValidationSchema,
    }),
    CacheModule.register({ ttl: 120, isGlobal: true, max: 100 }),
    ProductsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
  ],
})
export class AppModule {}
