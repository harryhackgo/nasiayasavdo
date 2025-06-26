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
import { CategoriesModule } from './categories/categories.module';
import { PartnersModule } from './partners/partners.module';
import { StockEntriesModule } from './stock-entries/stock-entries.module';
import { SalesModule } from './sales/sales.module';
import { DebtsModule } from './debts/debts.module';
import { PaymentsModule } from './payments/payments.module';
import { ReturnedProductsModule } from './returned-products/returned-products.module';
import { SalariesModule } from './salaries/salaries.module';
import { AuthGuard } from './guards/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';

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
    CategoriesModule,
    PartnersModule,
    StockEntriesModule,
    SalesModule,
    DebtsModule,
    PaymentsModule,
    ReturnedProductsModule,
    SalariesModule,
    JwtModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AppService,
  ],
})
export class AppModule {}
