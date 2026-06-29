import { AuctionStatus, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { email: 'alice@example.com', name: 'Alice', password },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { email: 'bob@example.com', name: 'Bob', password },
  });

  const now = Date.now();
  const hour = 60 * 60 * 1000;

  await prisma.auction.create({
    data: {
      title: 'Vintage Mechanical Watch',
      description: 'A beautifully restored 1960s mechanical wristwatch.',
      imageUrl: 'https://picsum.photos/seed/watch/600/400',
      startPrice: 100,
      status: AuctionStatus.LIVE,
      startsAt: new Date(now - hour),
      endsAt: new Date(now + 24 * hour),
      sellerId: alice.id,
    },
  });

  await prisma.auction.create({
    data: {
      title: 'Original Abstract Painting',
      description: 'Acrylic on canvas, signed by the artist. 80x60cm.',
      imageUrl: 'https://picsum.photos/seed/painting/600/400',
      startPrice: 250,
      status: AuctionStatus.LIVE,
      startsAt: new Date(now - hour),
      endsAt: new Date(now + 48 * hour),
      sellerId: bob.id,
    },
  });

  console.log('🌱 Seed complete. Login with alice@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
