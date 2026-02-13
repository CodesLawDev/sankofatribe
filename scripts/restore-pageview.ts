import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  try {
    // Read the backup file
    const backupPath = path.join(process.cwd(), 'for-referencing', 'PageView.json');
    const data = fs.readFileSync(backupPath, 'utf-8');
    const pageViews = JSON.parse(data);

    // Delete existing records (optional - comment out if you want to keep existing data)
    await prisma.pageView.deleteMany({});

    // Insert records in batches to avoid timeout
    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < pageViews.length; i += batchSize) {
      const batch = pageViews.slice(i, i + batchSize);
      
      // Transform dates from strings to Date objects
      const transformedBatch = batch.map((record: any) => ({
        ...record,
        createdAt: new Date(record.createdAt)
      }));

      await prisma.pageView.createMany({
        data: transformedBatch,
        skipDuplicates: true // Skip records with duplicate IDs
      });

      inserted += transformedBatch.length;
    }

  } catch (error) {
    console.error('Error restoring PageView data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
