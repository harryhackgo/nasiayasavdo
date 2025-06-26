import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '../guards/auth.guard';
import { UsersService } from '../users/users.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: 6000 },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, AuthGuard, UsersService],
  exports: [AuthService, JwtModule, AuthGuard],
})
export class AuthModule {}
