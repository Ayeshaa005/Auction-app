import { Controller, Get, Param } from '@nestjs/common';
import { BidsService } from './bids.service';

@Controller('auctions/:auctionId/bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Get()
  findForAuction(@Param('auctionId') auctionId: string) {
    return this.bidsService.findForAuction(auctionId);
  }
}
