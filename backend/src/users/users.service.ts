import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { hash, compare } from 'bcryptjs';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    // create user and wallet in a single transaction
    try {
      return await this.prisma.$transaction(async (tx) => {
        const hashed = await hash((dto as any).password ?? 'changeme', 10);
        // cast tx and data to any to avoid transient prisma client type mismatches
        const user = await (tx as any).user.create({ data: { username: dto.username, name: dto.name, password: hashed } as any });
        await (tx as any).wallet.create({ data: { userId: user.id, balance: 0 } as any });
        return user;
      });
    } catch (err: any) {
      // Prisma unique constraint error
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('A user with that username already exists');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async validatePassword(plain: string, hashed: string) {
    return compare(plain, hashed);
  }

  async setRefreshToken(userId: string, tokenHash: string | null) {
    return this.prisma.user.update({ where: { id: userId }, data: { refreshToken: tokenHash as any } as any });
  }
}
