import path from 'path';
import { db } from './database';

async function runSeed() {
  console.log('====================================================');
  console.log('KISAN SAATHI DATABASE SEED RUNNER');
  console.log('====================================================');

  const dbPath = process.env.DATABASE_STORAGE_PATH || path.join(process.cwd(), 'data', 'kisan_saathi.db.json');
  console.log(`[Seed] Target database file: ${dbPath}`);
  console.log('[Seed] Populating fresh 34-entity agricultural enterprise seed data...');

  const freshData = db.resetToSeed();
  const health = db.validateDatabaseHealth();

  if (!health.healthy) {
    console.error('[Seed] Database validation failed after seed:');
    health.errors.forEach((err, i) => console.error(`  ${i + 1}. ${err}`));
    process.exit(1);
  }

  console.log('\n[Seed] Successfully Seeded All 34 Core Enterprise Collections:');
  console.log('----------------------------------------------------');
  Object.entries(health.entitiesCounts).sort(([a], [b]) => a.localeCompare(b)).forEach(([table, count]) => {
    console.log(`  ✓ ${table.padEnd(25)} : ${count} items`);
  });
  console.log('----------------------------------------------------');
  console.log('====================================================');
  console.log('SEED PROCESS COMPLETED SUCCESSFULLY');
  console.log('====================================================\n');
}

runSeed().catch(err => {
  console.error('[Seed Error]', err);
  process.exit(1);
});
