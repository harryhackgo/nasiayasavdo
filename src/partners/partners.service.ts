import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { Prisma, Partner } from '@prisma/client';

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE
  async create(createPartnerDto: CreatePartnerDto): Promise<Partner> {
    try {
      const existingPartner = await this.prisma.partner.findUnique({
        where: { phone: createPartnerDto.phone },
      });

      if (existingPartner) {
        throw new BadRequestException('Partner with this phone already exists');
      }

      const existringUser = await this.prisma.user.findUnique({
        where: { id: createPartnerDto.userId },
      });
      if (!existringUser)
        throw new BadRequestException("User with this id doesn't exists");

      return await this.prisma.partner.create({
        data: createPartnerDto,
        // Include user relation
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error creating partner: ' + error.message,
      );
    }
  }

  // FIND ALL
  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PartnerWhereUniqueInput;
    where?: Prisma.PartnerWhereInput;
    orderBy?: Prisma.PartnerOrderByWithRelationInput;
  }): Promise<Partner[]> {
    try {
      return await this.prisma.partner.findMany({
        ...params,
        // Include related user
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error fetching partners: ' + error.message,
      );
    }
  }

  // FIND ONE
  async findOne(id: string): Promise<Partner> {
    try {
      const partner = await this.prisma.partner.findUnique({
        where: { id },
      });

      if (!partner) throw new NotFoundException('Partner not found');
      return partner;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error fetching partner: ' + error.message,
      );
    }
  }

  // UPDATE
  async update(
    id: string,
    updatePartnerDto: UpdatePartnerDto,
  ): Promise<Partner> {
    try {
      const partner = await this.prisma.partner.findUnique({ where: { id } });
      if (!partner) throw new NotFoundException('Partner not found');

      if (updatePartnerDto.userId) {
        const existringUser = await this.prisma.user.findUnique({
          where: { id: updatePartnerDto.userId },
        });
        if (!existringUser)
          throw new BadRequestException("User with this id doesn't exists");
      }

      return await this.prisma.partner.update({
        where: { id },
        data: updatePartnerDto,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error updating partner: ' + error.message,
      );
    }
  }

  // DELETE
  async remove(id: string): Promise<Partner> {
    try {
      const partner = await this.prisma.partner.findUnique({ where: { id } });
      if (!partner) throw new NotFoundException('Partner not found');

      return await this.prisma.partner.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error deleting partner: ' + error.message,
      );
    }
  }
}
