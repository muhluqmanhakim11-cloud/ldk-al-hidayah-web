import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['SUPER_ADMIN', 'KETUA', 'ADMIN_BIDANG']);
export const programStatusEnum = pgEnum('program_status', ['DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED']);
export const eventStatusEnum = pgEnum('event_status', ['UPCOMING', 'ONGOING', 'DONE', 'DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED']);
export const articleStatusEnum = pgEnum('article_status', ['DRAFT', 'PUBLISHED']);
export const recruitmentStatusEnum = pgEnum('recruitment_status', ['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED']);
export const galleryStatusEnum = pgEnum('gallery_status', ['DRAFT', 'PUBLISHED', 'ARCHIVED']);

// 1. users
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: roleEnum('role').default('ADMIN_BIDANG').notNull(),
  divisionId: integer('division_id'), // FK to divisions
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. periods
export const periods = pgTable('periods', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(), // e.g., "2026/2027"
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').default(false).notNull(),
  isRecruitmentOpen: boolean('is_recruitment_open').default(false).notNull(),
});

// 3. divisions
export const divisions = pgTable('divisions', {
  id: serial('id').primaryKey(),
  periodId: integer('period_id').notNull().references(() => periods.id),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. positions
export const positions = pgTable('positions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  level: integer('level').default(0), // for sorting hierarchy
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. members
export const members = pgTable('members', {
  id: serial('id').primaryKey(),
  periodId: integer('period_id').notNull().references(() => periods.id),
  name: varchar('name', { length: 255 }).notNull(),
  nim: varchar('nim', { length: 50 }),
  email: varchar('email', { length: 255 }),
  contact: varchar('contact', { length: 50 }),
  positionId: integer('position_id').notNull().references(() => positions.id),
  divisionId: integer('division_id').references(() => divisions.id),
  photoUrl: varchar('photo_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. programs
export const programs = pgTable('programs', {
  id: serial('id').primaryKey(),
  periodId: integer('period_id').notNull().references(() => periods.id),
  divisionId: integer('division_id').notNull().references(() => divisions.id),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique(),
  description: text('description'),
  objective: text('objective'),
  schedule: varchar('schedule', { length: 255 }), // e.g., "Setiap Bulan", "September 2026"
  status: programStatusEnum('status').default('DRAFT').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 7. events
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  periodId: integer('period_id').notNull().references(() => periods.id),
  divisionId: integer('division_id').references(() => divisions.id),
  programId: integer('program_id').references(() => programs.id),
  name: varchar('name', { length: 255 }).notNull(),
  date: timestamp('date'),
  time: varchar('time', { length: 255 }),
  location: varchar('location', { length: 255 }),
  description: text('description'),
  coverImage: varchar('cover_image', { length: 500 }),
  status: eventStatusEnum('status').default('DRAFT').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 8. articles
export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content'),
  coverImage: varchar('cover_image', { length: 500 }),
  authorId: integer('author_id').notNull().references(() => users.id),
  divisionId: integer('division_id').references(() => divisions.id),
  status: articleStatusEnum('status').default('DRAFT').notNull(),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. galleries
export const galleries = pgTable('galleries', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id),
  divisionId: integer('division_id').notNull().references(() => divisions.id),
  periodId: integer('period_id').notNull().references(() => periods.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  coverImage: varchar('cover_image', { length: 500 }),
  status: galleryStatusEnum('status').default('DRAFT').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 10. gallery_images
export const galleryImages = pgTable('gallery_images', {
  id: serial('id').primaryKey(),
  galleryId: integer('gallery_id').notNull().references(() => galleries.id),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  publicId: varchar('public_id', { length: 255 }).notNull(),
  format: varchar('format', { length: 50 }),
  bytes: integer('bytes'),
  width: integer('width'),
  height: integer('height'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 11. recruitments
export const recruitments = pgTable('recruitments', {
  id: serial('id').primaryKey(),
  periodId: integer('period_id').notNull().references(() => periods.id),
  name: varchar('name', { length: 255 }).notNull(),
  nim: varchar('nim', { length: 50 }).notNull(),
  studyProgram: varchar('study_program', { length: 255 }),
  semester: integer('semester'),
  whatsapp: varchar('whatsapp', { length: 50 }),
  email: varchar('email', { length: 255 }),
  interestedDivisionId: integer('interested_division_id').references(() => divisions.id),
  reason: text('reason'),
  photoUrl: varchar('photo_url', { length: 500 }),
  status: recruitmentStatusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  periodNimIdx: unique('period_nim_idx').on(table.periodId, table.nim),
}));

// 11b. recruitment_logs
export const recruitmentLogs = pgTable('recruitment_logs', {
  id: serial('id').primaryKey(),
  recruitmentId: integer('recruitment_id').notNull().references(() => recruitments.id, { onDelete: 'cascade' }),
  oldStatus: recruitmentStatusEnum('old_status'),
  newStatus: recruitmentStatusEnum('new_status').notNull(),
  changedBy: integer('changed_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 12. media_assets
export const mediaAssets = pgTable('media_assets', {
  id: serial('id').primaryKey(),
  publicId: varchar('public_id', { length: 255 }).notNull().unique(),
  secureUrl: varchar('secure_url', { length: 500 }).notNull(),
  format: varchar('format', { length: 50 }),
  width: integer('width'),
  height: integer('height'),
  bytes: integer('bytes'),
  folder: varchar('folder', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 13. site_settings
export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  orgName: varchar('org_name', { length: 255 }).notNull().default('LDK Al-Hidayah'),
  logoUrl: varchar('logo_url', { length: 500 }),
  description: text('description').default('Unit Kegiatan Mahasiswa tingkat Universitas yang bergerak di bidang kerohanian Islam, bertujuan untuk mewujudkan kampus madani.'),
  address: text('address').default('Gedung Student Center Lt. 2 Universitas Telkom, Bandung'), // Default dari referensi tapi nanti disesuaikan user
  email: varchar('email', { length: 255 }).default('halo@ldkalhidayah.com'),
  instagramUrl: varchar('instagram_url', { length: 500 }),
  youtubeUrl: varchar('youtube_url', { length: 500 }),
  tiktokUrl: varchar('tiktok_url', { length: 500 }),
  facebookUrl: varchar('facebook_url', { length: 500 }),
  vercelBadgeUrl: varchar('vercel_badge_url', { length: 1000 }),
  popupEnabled: boolean('popup_enabled').default(false).notNull(),
  popupImage: varchar('popup_image', { length: 500 }),
  popupDuration: integer('popup_duration').default(10).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 14. profiles (for Profil LDK public page CRUD)
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  imageUrl: varchar("image_url", { length: 255 }),
  orderIndex: integer("order_index").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("PUBLISHED"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const runningTexts = pgTable("running_texts", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations

export const usersRelations = relations(users, ({ one, many }) => ({
  division: one(divisions, {
    fields: [users.divisionId],
    references: [divisions.id],
  }),
  articles: many(articles),
}));

export const periodsRelations = relations(periods, ({ many }) => ({
  divisions: many(divisions),
  members: many(members),
  programs: many(programs),
  events: many(events),
  recruitments: many(recruitments),
  galleries: many(galleries),
}));

export const divisionsRelations = relations(divisions, ({ one, many }) => ({
  period: one(periods, {
    fields: [divisions.periodId],
    references: [periods.id],
  }),
  users: many(users),
  members: many(members),
  programs: many(programs),
  events: many(events),
  articles: many(articles),
  recruitments: many(recruitments),
  galleries: many(galleries),
}));

export const positionsRelations = relations(positions, ({ many }) => ({
  members: many(members),
}));

export const membersRelations = relations(members, ({ one }) => ({
  period: one(periods, {
    fields: [members.periodId],
    references: [periods.id],
  }),
  position: one(positions, {
    fields: [members.positionId],
    references: [positions.id],
  }),
  division: one(divisions, {
    fields: [members.divisionId],
    references: [divisions.id],
  }),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  period: one(periods, {
    fields: [programs.periodId],
    references: [periods.id],
  }),
  division: one(divisions, {
    fields: [programs.divisionId],
    references: [divisions.id],
  }),
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  period: one(periods, {
    fields: [events.periodId],
    references: [periods.id],
  }),
  division: one(divisions, {
    fields: [events.divisionId],
    references: [divisions.id],
  }),
  program: one(programs, {
    fields: [events.programId],
    references: [programs.id],
  }),
  galleries: many(galleries),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  division: one(divisions, {
    fields: [articles.divisionId],
    references: [divisions.id],
  }),
}));

export const galleriesRelations = relations(galleries, ({ one, many }) => ({
  event: one(events, {
    fields: [galleries.eventId],
    references: [events.id],
  }),
  period: one(periods, {
    fields: [galleries.periodId],
    references: [periods.id],
  }),
  division: one(divisions, {
    fields: [galleries.divisionId],
    references: [divisions.id],
  }),
  images: many(galleryImages),
}));

export const galleryImagesRelations = relations(galleryImages, ({ one }) => ({
  gallery: one(galleries, {
    fields: [galleryImages.galleryId],
    references: [galleries.id],
  }),
}));

export const recruitmentsRelations = relations(recruitments, ({ one, many }) => ({
  period: one(periods, {
    fields: [recruitments.periodId],
    references: [periods.id],
  }),
  interestedDivision: one(divisions, {
    fields: [recruitments.interestedDivisionId],
    references: [divisions.id],
  }),
  logs: many(recruitmentLogs),
}));

export const recruitmentLogsRelations = relations(recruitmentLogs, ({ one }) => ({
  recruitment: one(recruitments, {
    fields: [recruitmentLogs.recruitmentId],
    references: [recruitments.id],
  }),
  changedByUser: one(users, {
    fields: [recruitmentLogs.changedBy],
    references: [users.id],
  }),
}));

export const mediaAssetsRelations = relations(mediaAssets, () => ({}));
