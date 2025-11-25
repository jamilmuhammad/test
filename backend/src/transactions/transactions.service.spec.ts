import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  const mockPrisma: any = {
    wallet: { findUnique: jest.fn(), findMany: jest.fn() },
    transaction: { findMany: jest.fn() }
  };
  const svc = new TransactionsService(mockPrisma as any);

  it('topTransactionsForUser returns empty for missing wallet', async () => {
    mockPrisma.wallet.findUnique.mockResolvedValue(null);
    const res = await svc.topTransactionsForUser(999, 5);
    expect(res).toEqual([]);
  });
});
