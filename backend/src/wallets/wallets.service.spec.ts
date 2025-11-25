import { WalletsService } from './wallets.service';

// Simple unit tests that mock PrismaService methods used by WalletsService
describe('WalletsService', () => {
  let svc: WalletsService;
  const mockPrisma: any = {
    wallet: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    transaction: {
      create: jest.fn()
    },
    $transaction: jest.fn()
  };

  beforeEach(() => {
    // $transaction will call the callback with a tx object; we simulate by passing mockPrisma itself
    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockPrisma));
    svc = new WalletsService(mockPrisma as any);
  });

  it('deposit increases balance and creates transaction', async () => {
    mockPrisma.wallet.findUnique.mockResolvedValue({ id: 1, userId: 1, balance: 10 });
    mockPrisma.wallet.update.mockResolvedValue({ id: 1, balance: 15 });
    mockPrisma.transaction.create.mockResolvedValue({ id: 100, amount: 5 });

    const res = await svc.deposit(1, 5);
    expect(res.balance).toBe(15);
    expect(mockPrisma.transaction.create).toHaveBeenCalled();
  });

  it('transfer moves funds between wallets', async () => {
    // from wallet has 20, to wallet has 5
    const from = { id: 10, userId: 1, balance: 20 };
    const to = { id: 11, userId: 2, balance: 5 };
    mockPrisma.wallet.findUnique
      .mockResolvedValueOnce(from) // from
      .mockResolvedValueOnce(to); // to

    mockPrisma.wallet.update.mockResolvedValueOnce({ id: 10, balance: 15 });
    mockPrisma.wallet.update.mockResolvedValueOnce({ id: 11, balance: 10 });
    mockPrisma.transaction.create.mockResolvedValue({ id: 200, amount: 5 });

    const res = await svc.transfer(1, 2, 5);
    expect(res.from.balance).toBe(15);
    expect(res.to.balance).toBe(10);
    expect(mockPrisma.transaction.create).toHaveBeenCalled();
  });
});
