import { BadRequestException, Injectable } from '@nestjs/common';
import { AuctionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BidsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Places a bid atomically: validates the auction is live and the amount
   * beats the current bid, then records the bid and updates the auction.
   */
  async placeBid(auctionId: string, bidderId: string, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({ where: { id: auctionId } });

      if (!auction) {
        throw new BadRequestException('Auction not found');
      }
      if (auction.status !== AuctionStatus.LIVE) {
        throw new BadRequestException('Auction is not live');
      }
      const now = new Date();
      if (now < auction.startsAt || now > auction.endsAt) {
        throw new BadRequestException('Auction is not open for bidding');
      }
      if (auction.sellerId === bidderId) {
        throw new BadRequestException('You cannot bid on your own auction');
      }

      const minimum = auction.currentBid ?? auction.startPrice;
      const amountDecimal = new Prisma.Decimal(amount);
      if (amountDecimal.lessThanOrEqualTo(minimum)) {
        throw new BadRequestException(
          `Bid must be greater than ${minimum.toString()}`,
        );
      }

      const bid = await tx.bid.create({
        data: { auctionId, bidderId, amount: amountDecimal },
        include: { bidder: { select: { id: true, name: true } } },
      });

      await tx.auction.update({
        where: { id: auctionId },
        data: { currentBid: amountDecimal },
      });

      return bid;
    });
  }

  findForAuction(auctionId: string) {
    return this.prisma.bid.findMany({
      where: { auctionId },
      orderBy: { amount: 'desc' },
      include: { bidder: { select: { id: true, name: true } } },
    });
  }
}
