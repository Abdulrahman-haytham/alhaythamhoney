import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../src/lib/password';

export default async function setup() {
  const url = new URL(process.env.DATABASE_URL || 'http://invalid');
  if (!['localhost', '127.0.0.1'].includes(url.hostname) || !url.pathname.endsWith('_test')) {
    throw new Error('E2E requires a disposable local database whose name ends in _test.');
  }
  const db = new PrismaClient();
  try {
    await db.admin.upsert({
      where: { username: 'e2e-admin' },
      update: {},
      create: {
        username: 'e2e-admin',
        passwordHash: hashPassword('e2e-only-password'),
        name: 'Test admin',
      },
    });
    await db.product.upsert({
      where: { slug: 'e2e-honey' },
      update: { published: true, inStock: true },
      create: {
        slug: 'e2e-honey',
        name: 'عسل الاختبار',
        desc: 'وصف خاص بالاختبار الآلي فقط',
        image: '/images/products/black-seed-honey.webp',
        price: 1000,
        weight: '500 غرام',
        published: true,
      },
    });
  } finally {
    await db.$disconnect();
  }
}
