import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  // List top N transactions (by amount) involving a user's wallet
  async topTransactionsForUser(userId: string, n = 10) {
    // If caller requests `all` as the userId, return top N transactions across all users
    if (userId === 'all') {
      return this.prisma.transaction.findMany({
        orderBy: { amount: 'desc' },
        take: n,
      })
    }

    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return [];
    const txs = await this.prisma.transaction.findMany({
      where: { OR: [{ fromWalletId: wallet.id }, { toWalletId: wallet.id }] },
      orderBy: { amount: 'desc' },
      take: n,
    });
    return txs;
  }

  // Return a lightweight list of users suitable for selection in the admin UI
  async listUsersForSelection() {
    const users = await this.prisma.user.findMany({
      select: { id: true, username: true, name: true },
      orderBy: { username: 'asc' },
    })
    return users
  }

  // Compute overall top transacting users by total transaction value
  async topTransactingUsers(n = 10) {
    // optimized DB-level aggregation:
    // we join transactions to wallets (either as from or to) and sum amounts per user
    // Note: a transfer will be counted for both sender and receiver (each user's involvement).
    const limit = Number(n) || 10;
    const raw = await this.prisma.$queryRawUnsafe(
      `SELECT w."userId" as "userId", u.username as username, SUM(t.amount) as total
       FROM "Transaction" t
       JOIN "Wallet" w ON (w.id = t."fromWalletId" OR w.id = t."toWalletId")
       JOIN "User" u ON u.id = w."userId"
       GROUP BY w."userId", u.username
       ORDER BY total DESC
       LIMIT ${limit}`
    );
    // raw rows will have total as string (from numeric/decimal), coerce to number
    return (raw as Array<any>).map((r) => ({ userId: r.userId, username: r.username, total: Number(r.total) }));
  }
}
