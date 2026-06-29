export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export type AuctionStatus = 'DRAFT' | 'LIVE' | 'ENDED' | 'CANCELLED';

export interface Bid {
  id: string;
  amount: string;
  createdAt: string;
  bidder: { id: string; name: string };
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  startPrice: string;
  currentBid: string | null;
  status: AuctionStatus;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  seller: { id: string; name: string };
  bids?: Bid[];
  _count?: { bids: number };
}

export interface BidUpdate {
  auctionId: string;
  amount: string;
  bidder: { id: string; name: string };
  createdAt: string;
}
