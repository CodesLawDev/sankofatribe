const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

// Define table restoration order (respecting foreign key constraints)
const tableOrder = [
  // Independent tables first
  "User",
  "ProductRecord",
  "EventRecord",
  "NewsletterSubscriber",
  "MonthlyReport",
  "PageView",
  // Tables with foreign keys
  "Address",
  "Order",
  "OrderItem",
  "Payment",
  "EventTicketTier",
  "EventTicketOrder",
  "EventTicket",
  "WishlistItem",
  "LoginHistory",
];

const truncateOrder = [...tableOrder].reverse();

function convertValue(value) {
  if (value === null || value === undefined) {
    return null;
  }
  // Convert string dates back to Date objects
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  return value;
}

function convertRecord(record) {
  const converted = {};
  for (const [key, value] of Object.entries(record)) {
    converted[key] = convertValue(value);
  }
  return converted;
}

async function restoreTable(tableName) {
  const filePath = path.join(__dirname, "..", "backups", `public.${tableName}.jsonl`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${tableName} (file not found)`);
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.trim().split("\n").filter(line => line.trim());
  
  if (lines.length === 0) {
    console.log(`Skipping ${tableName} (empty)`);
    return;
  }

  const records = [];
  let parseErrors = 0;

  for (const line of lines) {
    try {
      records.push(convertRecord(JSON.parse(line)));
    } catch (error) {
      parseErrors++;
      if (parseErrors < 3) {
        console.error(`Error parsing ${tableName} record:`, error.message);
      }
    }
  }

  console.log(`Restoring ${tableName} (${records.length} rows)...`);

  const modelName = tableName.charAt(0).toLowerCase() + tableName.slice(1);
  
  let successCount = 0;
  let errorCount = 0;

  const useRawInsert = tableName === "PageView";

  if (prisma[modelName] && !useRawInsert) {
    const batchSize = 250;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      try {
        await prisma[modelName].createMany({
          data: batch,
          skipDuplicates: true,
        });
        successCount += batch.length;
      } catch (error) {
        for (const record of batch) {
          try {
            await prisma[modelName].create({
              data: record,
            });
            successCount++;
          } catch (insertError) {
            if (errorCount < 3) {
              const message = insertError?.message
                ? insertError.message.split("\n")[0]
                : String(insertError);
              console.error(`Error inserting into ${tableName} (id: ${record.id}):`, message);
            }
            errorCount++;
          }
        }
      }
    }
  } else {
    // Fallback to raw insert for tables without Prisma models
    const batchSize = 200;
    const columns = records.length > 0 ? Object.keys(records[0]) : [];
    const columnList = columns.map(c => `"${c}"`).join(", ");

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const values = [];
      const rowPlaceholders = batch.map((record, rowIndex) => {
        const placeholders = columns.map((_, colIndex) => {
          values.push(record[columns[colIndex]] ?? null);
          return `$${rowIndex * columns.length + colIndex + 1}`;
        });
        return `(${placeholders.join(", ")})`;
      });

      const query = `INSERT INTO "public"."${tableName}" (${columnList}) VALUES ${rowPlaceholders.join(", ")} ON CONFLICT DO NOTHING`;

      try {
        await prisma.$queryRawUnsafe(query, ...values);
        successCount += batch.length;
      } catch (error) {
        if (errorCount < 3) {
          const message = error?.message ? error.message.split("\n")[0] : String(error);
          console.error(`Error inserting into ${tableName}:`, message);
        }
        errorCount += batch.length;
      }
    }
  }

  console.log(`✓ Restored ${tableName} (${successCount} OK, ${errorCount} errors)`);
}

async function truncateTables() {
  console.log("Clearing existing data...\n");

  for (const tableName of truncateOrder) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tableName}" CASCADE;`);
      console.log(`✓ Truncated ${tableName}`);
    } catch (error) {
      console.error(`Error truncating ${tableName}:`, error.message);
    }
  }
}

async function main() {
  console.log("Starting database restoration...\n");

  await truncateTables();

  for (const tableName of tableOrder) {
    await restoreTable(tableName);
  }

  console.log("Database restoration complete!");
}

main()
  .catch((error) => {
    console.error("Restoration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
