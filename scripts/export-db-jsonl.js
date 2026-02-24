const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
  const backupDir = path.resolve(__dirname, "..", "backups");
  fs.mkdirSync(backupDir, { recursive: true });

  const tables = await prisma.$queryRaw`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_type = 'BASE TABLE'
      AND table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name;
  `;

  for (const row of tables) {
    const schema = row.table_schema;
    const table = row.table_name;
    const filePath = path.join(backupDir, `${schema}.${table}.jsonl`);
    const stream = fs.createWriteStream(filePath, { encoding: "utf8" });

    const rows = await prisma.$queryRawUnsafe(
      `SELECT row_to_json(t) AS row FROM "${schema}"."${table}" t;`
    );

    for (const record of rows) {
      stream.write(JSON.stringify(record.row) + "\n");
    }

    stream.end();
    console.log(`Exported ${schema}.${table} -> ${filePath}`);
  }
}

main()
  .catch((error) => {
    console.error("Export failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
