'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import type { Auction } from '@/lib/types';

// Local datetime string (YYYY-MM-DDTHH:mm) for the min attribute / default.
function toLocalInput(date: Date) {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default function NewAuctionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const now = new Date();

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-3">Sell an item</h1>
        <p className="text-gray-600">
          You need to be logged in to create an auction.
        </p>
        <Link
          href="/login"
          className="inline-block mt-4 rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Log in
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const price = Number(startPrice);
    if (!price || price < 0) {
      setError('Enter a valid starting price.');
      return;
    }
    const end = new Date(endsAt);
    if (!endsAt || end.getTime() <= Date.now()) {
      setError('End time must be in the future.');
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title,
        description,
        startPrice: price,
        startsAt: new Date().toISOString(),
        endsAt: end.toISOString(),
      };
      if (imageUrl.trim()) payload.imageUrl = imageUrl.trim();

      const { data } = await api.post<Auction>('/auctions', payload);
      await queryClient.invalidateQueries({ queryKey: ['auctions'] });
      router.push(`/auctions/${data.id}`);
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401) {
        setError('Your session expired. Please log in again.');
      } else {
        setError(
          'Could not create the auction. Check the fields and try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20';

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Sell an item</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            required
            minLength={3}
            placeholder="e.g. Vintage camera"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            required
            minLength={10}
            rows={4}
            placeholder="Describe the item (at least 10 characters)…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Image URL <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="url"
            placeholder="https://example.com/photo.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Starting price ($)
            </label>
            <input
              type="number"
              required
              min={0}
              step="0.01"
              placeholder="0.00"
              value={startPrice}
              onChange={(e) => setStartPrice(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ends at</label>
            <input
              type="datetime-local"
              required
              min={toLocalInput(now)}
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-black px-5 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create auction'}
          </button>
          <Link
            href="/"
            className="rounded-md border border-gray-300 px-5 py-2 hover:bg-gray-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
