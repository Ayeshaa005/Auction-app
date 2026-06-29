'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Auction } from '@/lib/types';

function formatMoney(value: string | null) {
  if (value == null) return '—';
  return `$${Number(value).toLocaleString()}`;
}

export default function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['auctions'],
    queryFn: async () => {
      const res = await api.get<Auction[]>('/auctions');
      return res.data;
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Live Auctions</h1>

      {isLoading && <p className="text-gray-500">Loading auctions…</p>}
      {isError && (
        <p className="text-red-600">
          Could not load auctions. Is the API running on port 4000?
        </p>
      )}

      {data && data.length === 0 && (
        <p className="text-gray-500">
          No auctions yet. Seed the database to get started.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((auction) => (
          <Link
            key={auction.id}
            href={`/auctions/${auction.id}`}
            className="block rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
          >
            {auction.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={auction.imageUrl}
                alt={auction.title}
                className="h-40 w-full object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{auction.title}</h2>
                <span className="text-xs rounded-full bg-green-100 text-green-700 px-2 py-0.5">
                  {auction.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {auction.description}
              </p>
              <p className="mt-3 text-sm">
                Current bid:{' '}
                <span className="font-semibold">
                  {formatMoney(auction.currentBid ?? auction.startPrice)}
                </span>
              </p>
              <p className="text-xs text-gray-400">
                {auction._count?.bids ?? 0} bids · by {auction.seller.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
