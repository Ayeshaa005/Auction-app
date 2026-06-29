'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { use, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { getBidsSocket } from '@/lib/socket';
import type { Auction, Bid, BidUpdate } from '@/lib/types';

function money(value: string | number | null | undefined) {
  if (value == null) return '—';
  return `$${Number(value).toLocaleString()}`;
}

export default function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['auction', id],
    queryFn: async () => {
      const res = await api.get<Auction>(`/auctions/${id}`);
      return res.data;
    },
  });

  const [liveBids, setLiveBids] = useState<Bid[]>([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'connecting' | 'live'>('connecting');

  // Seed live bids from the initial fetch.
  useEffect(() => {
    if (data?.bids) setLiveBids(data.bids);
  }, [data?.bids]);

  // Join the auction room and listen for real-time updates.
  useEffect(() => {
    const socket = getBidsSocket();

    const onConnect = () => {
      setStatus('live');
      socket.emit('joinAuction', { auctionId: id });
    };
    const onBidUpdate = (update: BidUpdate) => {
      if (update.auctionId !== id) return;
      setLiveBids((prev) => [
        {
          id: `${update.bidder.id}-${update.createdAt}`,
          amount: update.amount,
          createdAt: update.createdAt,
          bidder: update.bidder,
        },
        ...prev,
      ]);
    };

    if (socket.connected) onConnect();
    socket.on('connect', onConnect);
    socket.on('bidUpdate', onBidUpdate);

    return () => {
      socket.emit('leaveAuction', { auctionId: id });
      socket.off('connect', onConnect);
      socket.off('bidUpdate', onBidUpdate);
    };
  }, [id]);

  const highestBid = useMemo(() => {
    const current = data?.currentBid ?? data?.startPrice ?? '0';
    const top = liveBids[0]?.amount;
    return Math.max(Number(current), top ? Number(top) : 0);
  }, [data?.currentBid, data?.startPrice, liveBids]);

  async function submitBid(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Please log in to place a bid.');
      return;
    }
    const value = Number(amount);
    if (!value || value <= highestBid) {
      setError(`Bid must be greater than ${money(highestBid)}.`);
      return;
    }

    const socket = getBidsSocket();
    socket.emit(
      'placeBid',
      { auctionId: id, amount: value },
      (ack: { event?: string } | { error?: string }) => {
        if ('error' in ack && ack.error) {
          setError(ack.error);
        } else {
          setAmount('');
          void refetch();
        }
      },
    );
  }

  if (isLoading) return <p className="text-gray-500">Loading auction…</p>;
  if (isError || !data)
    return <p className="text-red-600">Auction not found.</p>;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <Link href="/" className="text-sm text-gray-500 hover:underline">
          ← Back to auctions
        </Link>
        {data.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.imageUrl}
            alt={data.title}
            className="mt-4 rounded-lg w-full max-h-80 object-cover"
          />
        )}
        <h1 className="mt-4 text-2xl font-bold">{data.title}</h1>
        <p className="mt-2 text-gray-600">{data.description}</p>
        <p className="mt-2 text-sm text-gray-400">Seller: {data.seller.name}</p>
      </div>

      <div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Current bid</span>
            <span
              className={`text-xs rounded-full px-2 py-0.5 ${
                status === 'live'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {status === 'live' ? '● Live' : 'Connecting…'}
            </span>
          </div>
          <p className="text-3xl font-bold">{money(highestBid)}</p>

          <form onSubmit={submitBid} className="mt-4 flex gap-2">
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`> ${highestBid}`}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2"
            />
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 shrink-0 whitespace-nowrap"
            >
              Bid
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {!user && (
            <p className="mt-2 text-sm text-gray-500">
              <Link href="/login" className="underline">
                Log in
              </Link>{' '}
              to place a bid.
            </p>
          )}
        </div>

        <h2 className="mt-6 mb-2 font-semibold">Bid history</h2>
        <ul className="space-y-2">
          {liveBids.length === 0 && (
            <li className="text-sm text-gray-500">No bids yet — be the first!</li>
          )}
          {liveBids.map((bid) => (
            <li
              key={bid.id}
              className="flex justify-between rounded-md border border-gray-100 bg-white px-3 py-2 text-sm"
            >
              <span>{bid.bidder.name}</span>
              <span className="font-semibold">{money(bid.amount)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
