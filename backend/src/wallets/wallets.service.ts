import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WalletsService {
  constructor(private prisma: PrismaService) {}

  async getBalanceByUserId(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new BadRequestException('Wallet not found');
    return {balance: wallet.balance};
  }

  async deposit(userId: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new BadRequestException('Wallet not found');
      const newBal = Number(wallet.balance) + amount;
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBal } });

      // to do validation status field addition
      const txRec = await tx.transaction.create({
        data: { toWalletId: wallet.id, amount, type: 'DEPOSIT', status: "COMPLETED" }
      });
      return { balance: newBal, transaction: txRec };
    });
  }

  async transfer(fromUserId: string, toUserId: string, amount: number) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    if (fromUserId === toUserId) throw new BadRequestException('Cannot transfer to same user');

    return this.prisma.$transaction(async (tx) => {
      const from = await tx.wallet.findUnique({ where: { userId: fromUserId } });
      const to = await tx.wallet.findUnique({ where: { userId: toUserId } });
      if (!from || !to) throw new BadRequestException('Wallet not found');
      if (Number(from.balance) < amount) throw new BadRequestException('Insufficient funds');

      const newFrom = Number(from.balance) - amount;
      const newTo = Number(to.balance) + amount;

      await tx.wallet.update({ where: { id: from.id }, data: { balance: newFrom } });
      await tx.wallet.update({ where: { id: to.id }, data: { balance: newTo } });

      // to do validation status
      const txRec = await tx.transaction.create({
        data: { fromWalletId: from.id, toWalletId: to.id, amount, type: 'TRANSFER', status: 'COMPLETED', fromUserId, toUserId }
      });

      return { transaction: txRec, from: { id: from.id, balance: newFrom }, to: { id: to.id, balance: newTo } };
    });
  }
}
