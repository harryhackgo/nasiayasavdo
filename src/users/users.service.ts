import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { username: createUserDto.username },
            { phone: createUserDto.phone },
          ],
        },
      });

      if (existingUser) {
        throw new BadRequestException(
          'User with this username or phone already exists',
        );
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating user: ' + error.message,
      );
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    try {
      return await this.prisma.user.findMany({
        ...params,
        include: {},
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching users: ' + error.message,
      );
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) throw new NotFoundException('User not found');

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching user: ' + error.message,
      );
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User not found');

      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating user: ' + error.message,
      );
    }
  }

  async remove(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User not found');

      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting user: ' + error.message,
      );
    }
  }

  async findOneByEmail(phone: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({ where: { phone } });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching user by phone: ' + error.message,
      );
    }
  }
}
