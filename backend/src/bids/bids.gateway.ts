import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../auth/jwt.strategy';
import { BidsService } from './bids.service';
import { PlaceBidDto } from './dto/place-bid.dto';

/**
 * Real-time bidding gateway.
 *
 * Clients join an auction "room" to receive live bid updates, and emit
 * `placeBid` to submit a bid. A successful bid is broadcast to everyone
 * in that auction's room as `bidUpdate`.
 */
@WebSocketGateway({
  namespace: '/bids',
  cors: {
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },
})
export class BidsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(BidsGateway.name);

  constructor(
    private readonly bidsService: BidsService,
    private readonly jwt: JwtService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('joinAuction')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody('auctionId') auctionId: string,
  ) {
    void client.join(this.room(auctionId));
    return { event: 'joined', auctionId };
  }

  @SubscribeMessage('leaveAuction')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody('auctionId') auctionId: string,
  ) {
    void client.leave(this.room(auctionId));
    return { event: 'left', auctionId };
  }

  @SubscribeMessage('placeBid')
  async handlePlaceBid(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: PlaceBidDto,
  ) {
    const bidder = this.authenticate(client);

    const bid = await this.bidsService.placeBid(
      body.auctionId,
      bidder.sub,
      body.amount,
    );

    this.server.to(this.room(body.auctionId)).emit('bidUpdate', {
      auctionId: body.auctionId,
      amount: bid.amount,
      bidder: bid.bidder,
      createdAt: bid.createdAt,
    });

    return { event: 'bidAccepted', bidId: bid.id };
  }

  private authenticate(client: Socket): JwtPayload {
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      (client.handshake.headers.authorization?.replace('Bearer ', '') ??
        undefined);

    if (!token) {
      throw new WsException('Unauthorized: missing token');
    }
    try {
      return this.jwt.verify<JwtPayload>(token);
    } catch {
      throw new WsException('Unauthorized: invalid token');
    }
  }

  private room(auctionId: string): string {
    return `auction:${auctionId}`;
  }
}
