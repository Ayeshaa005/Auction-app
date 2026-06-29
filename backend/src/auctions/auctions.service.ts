import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuctionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuctionDto, UpdateAuctionDto } from './dto/auction.dto';

@Injectable()
export class AuctionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.auction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        seller: { select: { id: true, name: true } },
        _count: { select: { bids: true } },
      },
    });
  }

  async findOne(id: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, name: true } },
        bids: {
          orderBy: { amount: 'desc' },
          take: 20,
          include: { bidder: { select: { id: true, name: true } } },
        },
      },
    });
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }
    return auction;
  }

  create(sellerId: string, dto: CreateAuctionDto) {
    return this.prisma.auction.create({
      data: {
        title: dto.title,
        description: dto.description,
        imageUrl: dto.imageUrl,
        startPrice: dto.startPrice,
        status: AuctionStatus.LIVE,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : new Date(),
        endsAt: new Date(dto.endsAt),
        sellerId,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateAuctionDto) {
    await this.assertOwner(id, userId);
    return this.prisma.auction.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.assertOwner(id, userId);
    await this.prisma.auction.delete({ where: { id } });
    return { success: true };
  }

  private async assertOwner(id: string, userId: string) {
    const auction = await this.prisma.auction.findUnique({ where: { id } });
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }
    if (auction.sellerId !== userId) {
      throw new ForbiddenException('You do not own this auction');
    }
  }
}
