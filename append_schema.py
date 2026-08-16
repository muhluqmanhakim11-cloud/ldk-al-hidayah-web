import os

schema_path = r"d:\ldk-al-hidayah\src\db\schema.ts"
content_to_append = """

// --- DIVISION NOTES ---
export const divisionNotes = pgTable('division_notes', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  divisionId: integer('division_id'), // Nullable if superadmin general note
  createdBy: integer('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
"""

with open(schema_path, 'a', encoding='utf-8') as f:
    f.write(content_to_append)
print("Schema appended")
