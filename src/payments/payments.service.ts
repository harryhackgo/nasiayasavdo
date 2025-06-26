import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreatePaymentDto): Promise<Payment> {
    try {
      const [partner, user, debt] = await Promise.all([
        this.prisma.partner.findUnique({ where: { id: createDto.partnerId } }),
        this.prisma.user.findUnique({ where: { id: createDto.userId } }),
        createDto.debtId
          ? this.prisma.debt.findUnique({ where: { id: createDto.debtId } })
          : null,
      ]);

      if (!partner)
        throw new BadRequestException("Partner with this id doesn't exist");
      if (createDto.type == 'OUT' && partner.role == 'CUSTOMER')
        throw new BadRequestException(
          'OUT payments should not have partner who has CUSTOMER role',
        );
      if (!user)
        throw new BadRequestException("User with this id doesn't exist");
      if (createDto.type == 'IN' && !debt)
        throw new BadRequestException("Debt with this id doesn't exist");
      else if (createDto.type == 'IN' && debt) {
        const sale = await this.prisma.sale.findUnique({
          where: { id: debt.saleId },
        });
        if (!sale)
          throw new BadRequestException(
            'Sale for this debt was not found. Verify that id of the saleId in debt matches the id of the sale',
          );
        else if (sale.partnerId != createDto.partnerId)
          throw new BadRequestException(
            "Debt you are trying to cover is not this client's",
          );
      }
      if (!user.is_active) throw new BadRequestException('User is not active');
      if (!partner.is_active)
        throw new BadRequestException('Partner is not active');
      if (createDto.type === 'OUT' && createDto.debtId) {
        throw new BadRequestException(
          'OUT type payments should not be linked to debt',
        );
      }
      if (!/^\d+(\.\d{1,2})?$/.test(createDto.amount.toString())) {
        throw new BadRequestException(
          'Amount must be a valid currency (e.g. 12.34)',
        );
      }
      if (debt?.status == 'CLOSED')
        throw new BadRequestException('Debt is already fully paid');

      if (createDto.amount <= 0) {
        throw new BadRequestException('Amount should be greater than zero');
      }

      if (createDto.type == 'IN' && debt) {
        if (debt && debt.paid_amount.add(createDto.amount).gt(debt.total_debt))
          throw new BadRequestException(`Payment exceeds total debt
You currently need to pay $${debt.total_debt.sub(debt.paid_amount).toString()}
But you are trying to pay $${createDto.amount}`);

        const monthsCoveredBefore = debt.paid_amount
          .div(debt.total_debt.div(debt.time))
          .toDecimalPlaces(0, Decimal.ROUND_FLOOR)
          .toNumber();

        const newPaidAmount = debt.paid_amount.add(createDto.amount);
        const monthsCoveredAfter = newPaidAmount
          .div(debt.total_debt.div(debt.time))
          .toDecimalPlaces(0, Decimal.ROUND_FLOOR)
          .toNumber();

        const monthsToShift = monthsCoveredAfter - monthsCoveredBefore;

        let newDueDate = debt.next_due_date;
        if (monthsToShift > 0) {
          newDueDate = new Date(debt.next_due_date!);
          newDueDate.setMonth(newDueDate.getMonth() + monthsToShift);
        }

        const status = newPaidAmount.gte(debt.total_debt) ? 'CLOSED' : 'OPEN';

        await this.prisma.debt.update({
          where: { id: debt.id },
          data: {
            paid_amount: newPaidAmount,
            next_due_date: newDueDate,
            status,
            is_late: false,
          },
        });
        await this.prisma.partner.update({
          where: { id: partner.id },
          data: { balance: partner.balance.toNumber() + createDto.amount },
        });
      } else if (createDto.type == 'OUT') {
        await this.prisma.partner.update({
          where: { id: partner.id },
          data: { balance: partner.balance.toNumber() + createDto.amount },
        });
      }
      return await this.prisma.payment.create({
        data: createDto,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error creating payment: ' + error.message,
      );
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PaymentWhereUniqueInput;
    where?: Prisma.PaymentWhereInput;
    orderBy?: Prisma.PaymentOrderByWithRelationInput;
  }): Promise<Payment[]> {
    try {
      return await this.prisma.payment.findMany({
        ...params,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error fetching payments: ' + error.message,
      );
    }
  }

  async findOne(id: string): Promise<Payment> {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id },
      });

      if (!payment) throw new NotFoundException('Payment not found');
      return payment;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error fetching payment: ' + error.message,
      );
    }
  }

  async update(id: string, updateDto: UpdatePaymentDto): Promise<Payment> {
    try {
      const existing = await this.prisma.payment.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Payment not found');

      if (
        updateDto.payment_type &&
        existing.payment_type !== updateDto.payment_type
      )
        throw new BadRequestException(
          'Cannot change the payment type of the transaction. Ex: from OUT to IN',
        );

      const [partner, user, debt] = await Promise.all([
        updateDto.partnerId
          ? this.prisma.partner.findUnique({
              where: { id: updateDto.partnerId },
            })
          : null,
        updateDto.userId
          ? this.prisma.user.findUnique({ where: { id: updateDto.userId } })
          : null,
        updateDto.debtId
          ? this.prisma.debt.findUnique({ where: { id: updateDto.debtId } })
          : null,
      ]);

      if (updateDto.partnerId && !partner)
        throw new BadRequestException("Partner doesn't exist");
      if (
        updateDto.partnerId &&
        existing.type == 'OUT' &&
        partner!.role == 'CUSTOMER'
      )
        throw new BadRequestException(
          'OUT payments should not have partner who has CUSTOMER role',
        );
      if (updateDto.userId && !user)
        throw new BadRequestException("User doesn't exist");
      if (updateDto.debtId && !debt)
        throw new BadRequestException("Debt doesn't exist");

      if (updateDto.debtId && debt) {
        const sale = await this.prisma.sale.findUnique({
          where: { id: debt.saleId },
        });
        if (!sale)
          throw new BadRequestException(
            'Sale for this debt with this id was not found',
          );
        if (sale.partnerId !== (updateDto.partnerId || existing.partnerId))
          throw new BadRequestException(
            "Debt you are trying to cover is not this client's",
          );
      }

      if (user && !user.is_active)
        throw new BadRequestException('User is not active');
      if (partner && !partner.is_active)
        throw new BadRequestException('Partner is not active');

      if (
        updateDto.amount &&
        !/^[\d]+(\.\d{1,2})?$/.test(updateDto.amount.toString())
      ) {
        throw new BadRequestException(
          'Amount must be a valid currency (e.g. 12.34)',
        );
      }
      if (updateDto.amount && updateDto.amount <= 0) {
        throw new BadRequestException('Amount should be greater than zero');
      }

      const updates: Prisma.PaymentUpdateInput = { ...updateDto };

      if (updateDto.amount && existing.type === 'IN' && debt) {
        const newPaidAmount = debt.paid_amount
          .sub(existing.amount)
          .add(updateDto.amount);
        if (newPaidAmount.gt(debt.total_debt)) {
          throw new BadRequestException(`This amount exceeds total debt
  You currently need to pay $${debt.total_debt.sub(debt.paid_amount.sub(existing.amount)).toString()}
  But you are trying to pay $${updateDto.amount}`);
        }

        const monthlyPayment = debt.total_debt.div(debt.time);
        const monthsCoveredBefore = debt.paid_amount
          .sub(existing.amount)
          .div(monthlyPayment)
          .toDecimalPlaces(0, Decimal.ROUND_FLOOR)
          .toNumber();

        const monthsCoveredAfter = newPaidAmount
          .div(monthlyPayment)
          .toDecimalPlaces(0, Decimal.ROUND_FLOOR)
          .toNumber();

        const monthsToShift = monthsCoveredAfter - monthsCoveredBefore;
        let newDueDate = debt.next_due_date;

        if (monthsToShift > 0 && newDueDate) {
          newDueDate = new Date(newDueDate);
          newDueDate.setMonth(newDueDate.getMonth() + monthsToShift);
        }

        const status = newPaidAmount.gte(debt.total_debt) ? 'CLOSED' : 'OPEN';

        await this.prisma.$transaction([
          this.prisma.debt.update({
            where: { id: debt.id },
            data: {
              paid_amount: newPaidAmount,
              next_due_date: newDueDate,
              status,
              is_late: false,
            },
          }),
          this.prisma.partner.update({
            where: { id: updateDto.partnerId || existing.partnerId },
            data: {
              balance: (partner ??
                (await this.prisma.partner.findUnique({
                  where: { id: existing.partnerId },
                })))!.balance
                .sub(partner ? 0 : existing.amount)
                .add(updateDto.amount),
            },
          }),
        ]);
      } else if (updateDto.amount && existing.type === 'OUT') {
        const oldPartner = await this.prisma.partner.findUnique({
          where: { id: existing.partnerId },
        });

        const updatedBalance = partner
          ? partner.balance.add(updateDto.amount)
          : oldPartner!.balance.sub(existing.amount).add(updateDto.amount);

        await this.prisma.partner.update({
          where: { id: partner?.id ?? existing.partnerId },
          data: { balance: updatedBalance },
        });
      }

      return await this.prisma.payment.update({
        where: { id },
        data: updates,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error updating payment: ' + error.message,
      );
    }
  }

  async remove(id: string): Promise<Payment> {
    try {
      const exists = await this.prisma.payment.findUnique({ where: { id } });
      if (!exists) throw new NotFoundException('Payment not found');

      return await this.prisma.payment.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'Error deleting payment: ' + error.message,
      );
    }
  }
}
