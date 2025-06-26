import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalaryDto } from './dto/create-salary.dto';
import { UpdateSalaryDto } from './dto/update-salary.dto';
import { Prisma, Salary } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SalariesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSalaryDto: CreateSalaryDto): Promise<Salary> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: createSalaryDto.userId },
      });

      if (!user) {
        throw new BadRequestException('User with this ID does not exist');
      }

      await this.prisma.user.update({
        where: { id: createSalaryDto.userId },
        data: { balance: user.balance.add(createSalaryDto.amount) },
      });

      return await this.prisma.salary.create({
        data: createSalaryDto,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error creating salary: ' + error.message,
      );
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.SalaryWhereUniqueInput;
    where?: Prisma.SalaryWhereInput;
    orderBy?: Prisma.SalaryOrderByWithRelationInput;
  }): Promise<Salary[]> {
    try {
      return await this.prisma.salary.findMany({
        ...params,
        include: {
          user: true,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error fetching salaries: ' + error.message,
      );
    }
  }

  async findOne(id: string): Promise<Salary> {
    try {
      const salary = await this.prisma.salary.findUnique({
        where: { id },
        include: {
          user: true,
        },
      });

      if (!salary) throw new NotFoundException('Salary not found');

      return salary;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error fetching salary: ' + error.message,
      );
    }
  }

  async update(id: string, updateDto: UpdateSalaryDto): Promise<Salary> {
    try {
      const existingSalary = await this.prisma.salary.findUnique({
        where: { id },
      });
      if (!existingSalary) {
        throw new NotFoundException('Salary not found');
      }

      const amount = updateDto.amount
        ? new Decimal(updateDto.amount)
        : existingSalary.amount;

      if (updateDto.userId && updateDto.userId !== existingSalary.userId) {
        const [oldUser, newUser] = await Promise.all([
          this.prisma.user.findUnique({
            where: { id: existingSalary.userId },
          }),
          this.prisma.user.findUnique({
            where: { id: updateDto.userId },
          }),
        ]);

        if (!newUser) {
          throw new BadRequestException('New user does not exist');
        }

        if (!oldUser) {
          throw new BadRequestException('Old user does not exist');
        }

        await this.prisma.$transaction([
          this.prisma.user.update({
            where: { id: oldUser.id },
            data: {
              balance: oldUser.balance.sub(existingSalary.amount),
            },
          }),
          // Add to new user
          this.prisma.user.update({
            where: { id: newUser.id },
            data: {
              balance: newUser.balance.add(amount),
            },
          }),
        ]);
      } else if (updateDto.amount) {
        // If only amount is being updated (user not changed)
        const user = await this.prisma.user.findUnique({
          where: { id: existingSalary.userId },
        });

        if (!user) throw new BadRequestException('User not found');

        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            balance: user.balance
              .sub(existingSalary.amount)
              .add(updateDto.amount),
          },
        });
      }

      return await this.prisma.salary.update({
        where: { id },
        data: updateDto,
        include: {
          user: true,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error updating salary: ' + error.message,
      );
    }
  }

  async remove(id: string): Promise<Salary> {
    try {
      const salary = await this.prisma.salary.findUnique({ where: { id } });
      if (!salary) throw new NotFoundException('Salary not found');

      return await this.prisma.salary.delete({
        where: { id },
        include: {
          user: true,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error deleting salary: ' + error.message,
      );
    }
  }
}
