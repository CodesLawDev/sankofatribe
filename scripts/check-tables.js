const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;
  
  console.log("Current database tables:");
  tables.forEach(t => console.log(`  - ${t.table_name}`));
  
  // Check row counts
  console.log("\nRow counts:");
  for (const table of tables) {
    if (table.table_name !== '_prisma_migrations') {
      try {
        const count = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as count FROM "${table.table_name}";`
        );
        console.log(`  ${table.table_name}: ${count[0].count} rows`);
      } catch (error) {
        console.log(`  ${table.table_name}: Error - ${error.message}`);
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
