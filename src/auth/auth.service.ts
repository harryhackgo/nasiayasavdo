import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Role } from '../enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  getRoles(user) {
    const roles: Array<Role> = [];
    roles.push(user.role);
    return roles;
  }

  async getTokens(user) {
    const roles = this.getRoles(user);

    const payload = {
      id: user.id,
      email: user.email,
      roles: roles,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME,
      }),

      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async signInUser(createAuthDto: CreateAuthDto) {
    try {
      const { phone, password } = createAuthDto;
      const user = await this.userService.findOneByPhone(phone);

      if (!user) {
        throw new NotFoundException('Phone or password is wrong');
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new NotFoundException('Phone or password is wrong');
      }
      if (!user.is_active) {
        throw new NotFoundException('Account is not activated');
      }
      const { access_token, refresh_token } = await this.getTokens(user);

      return { access_token, refresh_token };
    } catch (error) {
      throw new NotFoundException('Error signing in user: ' + error.message);
    }
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_TOKEN_KEY,
      });
      if (!decoded) {
        throw new NotFoundException('Invalid refresh token');
      }
      const userId = decoded.id;
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const { access_token, refresh_token } = await this.getTokens(user);
      return { access_token, refresh_token };
    } catch {
      throw new NotFoundException('Invalid refresh token');
    }
  }
}
