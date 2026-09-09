import fs from 'fs';
import path from 'path';
import { db } from './database';

async function runMigration() {
  console.log('====================================================');
  console.log('KISAN SAATHI DATABASE MIGRATION RUNNER');
  console.log('====================================================');

  const dbPath = process.env.DATABASE_STORAGE_PATH || path.join(process.cwd(), 'data', 'kisan_saathi.db.json');
  console.log(`[Migration] Database file target: ${dbPath}`);

  if (!fs.existsSync(dbPath)) {
    console.log('[Migration] Database file not found. Auto-seeding initial schema...');
    db.resetToSeed();
  }

  console.log('[Migration] Validating schema integrity and entity relationships...');
  const health = db.validateDatabaseHealth();

  if (!health.healthy) {
    console.error('[Migration] Database schema validation failed with errors:');
    health.errors.forEach((err, i) => console.error(`  ${i + 1}. ${err}`));
    process.exit(1);
  }

  console.log('\n[Migration] Schema Validation Succeeded. Entity Table Summary:');
  console.log('----------------------------------------------------');
  const sortedTables = Object.entries(health.entitiesCounts).sort(([a], [b]) => a.localeCompare(b));
  sortedTables.forEach(([tableName, count]) => {
    console.log(`  ✓ ${tableName.padEnd(25)} : ${count} records`);
  });
  console.log('----------------------------------------------------');
  console.log(`Total active entity tables: ${sortedTables.length} / 34`);
  console.log('====================================================');
  console.log('MIGRATION COMPLETED SUCCESSFULLY');
  console.log('====================================================\n');
}

runMigration().catch(err => {
  console.error('[Migration Error]', err);
  process.exit(1);
});
