import os

schema_path = r"d:\ldk-al-hidayah\src\db\schema.ts"
content_to_append = """

// --- PENSOS KUNJUNGAN TOKOH ---
export const pensosKunjunganTokoh = pgTable('pensos_kunjungan_tokoh', {
  id: serial('id').primaryKey(),
  namaTokoh: varchar('nama_tokoh', { length: 255 }).notNull(),
  kategori: varchar('kategori', { length: 100 }).notNull(), // Ulama / Tokoh Masyarakat / Pejabat
  tanggal: timestamp('tanggal').notNull(),
  tujuan: text('tujuan').notNull(),
  hasilKunjungan: text('hasil_kunjungan'),
  pic: varchar('pic', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('Terjadwal').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
"""

with open(schema_path, 'a', encoding='utf-8') as f:
    f.write(content_to_append)
print("Schema updated with Kunjungan Tokoh")
