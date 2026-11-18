// Seed of Bidium test data for e2e (run from the e2e folder: node scripts/seed.js).
// The script can be run many times: it creates or updates ONLY its own records
// (@bidium.test accounts and auctions with fixed ids) and does not touch other data.
//
//   node scripts/seed.js               - create/update all test data
//   node scripts/seed.js --lot <lotId> - quickly reset one lot to its initial state
//
// Prisma Client and bcryptjs are taken from the node_modules of the app itself (repository root),
// so dependencies are not duplicated.
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });

const appModules = path.resolve(__dirname, '../../node_modules');
const { PrismaClient } = require(path.join(appModules, '@prisma/client'));
const bcrypt = require(path.join(appModules, 'bcryptjs'));

const HOUR = 60 * 60 * 1000;

// Fixed ids: the same values are written in config/environments/dev.json
const ID = {
  users: {
    owner: '6a0000000000000000000001',
    buyer: '6a0000000000000000000002',
    admin: '6a0000000000000000000003',
    blockedOwner: '6a0000000000000000000004',
  },
  categories: { electronics: '6a00000000000000000000c1', furniture: '6a00000000000000000000c2' },
};

const USERS = [
  { key: 'owner', email: 'owner@bidium.test', name: 'TAF Owner', role: 'USER', isActive: true },
  { key: 'buyer', email: 'buyer@bidium.test', name: 'TAF Buyer', role: 'USER', isActive: true },
  { key: 'admin', email: 'admin@bidium.test', name: 'TAF Admin', role: 'ADMIN', isActive: true },
  // "blocked" in Bidium means a user with isActive = false
  { key: 'blockedOwner', email: 'blocked@bidium.test', name: 'TAF Blocked', role: 'USER', isActive: false },
];

// One auction = one lot, so the lot stays active for the whole auction.
const AUCTIONS = [
  // lots for AT-02 (one per browser): start 1500, step 50, buyout 4000
  { n: 1, title: 'TAF: lot for chromium', owner: 'owner', category: 'electronics', startBid: 1500, step: 50, buyNow: 4000 },
  { n: 2, title: 'TAF: lot for firefox', owner: 'owner', category: 'electronics', startBid: 1500, step: 50, buyNow: 4000 },
  { n: 3, title: 'TAF: lot for webkit', owner: 'owner', category: 'electronics', startBid: 1500, step: 50, buyNow: 4000 },
  // auctions for AT-03 (also the "extra" cards for the AT-04 catalog filter)
  { n: 4, title: "TAF: owner's auction", owner: 'owner', category: 'furniture', startBid: 5000, step: 100, buyNow: 12000 },
  { n: 5, title: "TAF: blocked owner's auction", owner: 'blockedOwner', category: 'electronics', startBid: 9000, step: 100, buyNow: 20000 },
];

const auctionId = (n) => `6a00000000000000000000a${n}`;
const lotId = (n) => `6a00000000000000000000b${n}`;
const linkId = (n) => `6a00000000000000000000d${n}`;
const lotCategoryId = (n) => `6a00000000000000000000e${n}`;

function assertSafeDatabase(url) {
  if (!url) throw new Error('DATABASE_URL is not set (see e2e/.env.example)');
  const isLocal = /^mongodb(\+srv)?:\/\/([^@/]*@)?(localhost|127\.0\.0\.1)[:/]/.test(url);
  if (!isLocal && process.env.SEED_ALLOW_REMOTE !== 'true') {
    throw new Error('Seed is allowed only for a local database. Set SEED_ALLOW_REMOTE=true for any other database');
  }
}

// The auction has already started and ends far in the future, so the lot is in the "bidding in progress" state.
const activeDates = () => ({
  startDate: new Date(Date.now() - HOUR),
  endDate: new Date(Date.now() + 7 * 24 * HOUR),
});

async function resetLot(prisma, id) {
  const lot = await prisma.lot.findUnique({ where: { id } });
  if (!lot) throw new Error(`Lot ${id} not found. Run the full seed first.`);
  await prisma.bid.deleteMany({ where: { lotId: id } });
  await prisma.lot.update({ where: { id }, data: { isSold: false } });
  await prisma.auction.update({ where: { id: lot.auctionId }, data: activeDates() });
}

async function seedAll(prisma) {
  const password = process.env.TEST_PASSWORD;
  if (!password) throw new Error('TEST_PASSWORD is not set (see e2e/.env.example)');
  const hash = await bcrypt.hash(password, 10);

  const userIds = {};
  for (const u of USERS) {
    const data = { name: u.name, role: u.role, isActive: u.isActive, password: hash, emailVerified: new Date() };
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: data,
      create: { id: ID.users[u.key], email: u.email, ...data },
    });
    userIds[u.key] = user.id;
  }

  const categoryIds = {};
  for (const [key, name] of [['electronics', 'Electronics'], ['furniture', 'Furniture']]) {
    const category = await prisma.category.upsert({
      where: { id: ID.categories[key] },
      update: { name },
      create: { id: ID.categories[key], name },
    });
    categoryIds[key] = category.id;
  }

  for (const a of AUCTIONS) {
    const auction = { title: a.title, isPublished: true, isApproved: true, ...activeDates() };
    await prisma.auction.upsert({
      where: { id: auctionId(a.n) },
      update: auction,
      create: { id: auctionId(a.n), description: 'TAF test data (Lab 5)', ...auction },
    });

    const link = { userId: userIds[a.owner], auctionId: auctionId(a.n), role: 'OWNER' };
    await prisma.userAuction.upsert({ where: { id: linkId(a.n) }, update: link, create: { id: linkId(a.n), ...link } });

    const lot = {
      auctionId: auctionId(a.n),
      title: a.title,
      position: 1,
      description: 'TAF test lot',
      startBid: a.startBid,
      minBidIncrement: a.step,
      buyNowBid: a.buyNow,
      isSold: false,
    };
    await prisma.lot.upsert({ where: { id: lotId(a.n) }, update: lot, create: { id: lotId(a.n), ...lot } });
    await prisma.bid.deleteMany({ where: { lotId: lotId(a.n) } });

    await prisma.lotCategory.deleteMany({ where: { lotId: lotId(a.n) } });
    await prisma.lotCategory.create({
      data: { id: lotCategoryId(a.n), lotId: lotId(a.n), categoryId: categoryIds[a.category] },
    });
  }
}

async function main() {
  assertSafeDatabase(process.env.DATABASE_URL);
  const prisma = new PrismaClient();
  try {
    const lotArg = process.argv.indexOf('--lot');
    if (lotArg !== -1) {
      await resetLot(prisma, process.argv[lotArg + 1]);
    } else {
      await seedAll(prisma);
      console.log('[seed] Bidium test data is ready');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(`[seed] error: ${e.message}`);
  process.exit(1);
});
