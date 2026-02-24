const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();
const backupDir = path.join(__dirname, "..", "backups");

function readBackupCount(tableName) {
  const filePath = path.join(backupDir, `public.${tableName}.jsonl`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const contents = fs.readFileSync(filePath, "utf8").trim();
  if (!contents) {
    return 0;
  }

  return contents.split(/\r?\n/).length;
}

async function readDbCount(tableName) {
  const result = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS count FROM "public"."${tableName}";`
  );
  return result[0].count;
}

async function main() {
  const tableNames = fs
    .readdirSync(backupDir)
    .filter((name) => name.startsWith("public.") && name.endsWith(".jsonl"))
    .map((name) => name.replace(/^public\./, "").replace(/\.jsonl$/, ""))
    .filter((name) => name !== "_prisma_migrations")
    .sort();

  console.log("Backup vs DB row counts:\n");
  console.log("(Skipping _prisma_migrations)\n");

  let mismatches = 0;

  for (const tableName of tableNames) {
    const backupCount = readBackupCount(tableName);
    const dbCount = await readDbCount(tableName);
    const status = backupCount === dbCount ? "OK" : "MISMATCH";

    if (status === "MISMATCH") {
      mismatches += 1;
    }

    console.log(
      `${tableName.padEnd(24)} backup=${String(backupCount).padStart(6)}  db=${String(dbCount).padStart(6)}  ${status}`
    );
  }

  if (mismatches > 0) {
    console.log(`\nFound ${mismatches} mismatch(es).`);
    process.exitCode = 1;
  } else {
    console.log("\nAll counts match.");
  }
}

main()
  .catch((error) => {
    console.error("Verification failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
