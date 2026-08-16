import { sql } from 'drizzle-orm';
import { db } from './src/db';

async function dropTables() {
  const tables = [
    'dkm_jadwal_petugas',
    'dkm_inventaris',
    'dkm_piket_kebersihan',
    'kader_database',
    'kader_mentoring_absensi',
    'kominfo_content_planner',
    'pensos_kajian_kelas',
    'pensos_kegiatan_sosial',
    'pensos_relasi_fsldk',
    'seni_olahraga_agenda',
    'announcement_acknowledgments'
  ];
  
  for (const table of tables) {
    try {
      await db.execute(sql.raw(`DROP TABLE IF EXISTS ${table} CASCADE;`));
      console.log(`Dropped ${table}`);
    } catch(e) {
      console.log(`Error dropping ${table}`, e);
    }
  }
  process.exit(0);
}

dropTables();
