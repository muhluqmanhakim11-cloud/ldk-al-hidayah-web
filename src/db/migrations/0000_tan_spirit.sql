CREATE TYPE "public"."article_status" AS ENUM('DRAFT', 'PUBLISHED');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('UPCOMING', 'ONGOING', 'DONE', 'DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."gallery_status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."program_status" AS ENUM('DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."recruitment_status" AS ENUM('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('super_admin', 'admin_dkm', 'admin_kaderisasi', 'admin_kominfo', 'admin_pensos', 'admin_seni_olahraga');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"division_id" integer,
	"action" varchar(50) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_name" varchar(255) NOT NULL,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcement_acknowledgments" (
	"id" serial PRIMARY KEY NOT NULL,
	"announcement_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"is_read" boolean DEFAULT true NOT NULL,
	"reply_message" text,
	"replied_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "announcement_user_idx" UNIQUE("announcement_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"target_role" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text,
	"cover_image" varchar(500),
	"author_id" integer NOT NULL,
	"division_id" integer,
	"status" "article_status" DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "division_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"division_id" integer,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "divisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"period_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "divisions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "dkm_inventaris" (
	"id" serial PRIMARY KEY NOT NULL,
	"kode_barang" varchar(50) NOT NULL,
	"nama_barang" varchar(150) NOT NULL,
	"kategori" varchar(100),
	"jumlah" integer DEFAULT 1 NOT NULL,
	"kondisi" varchar(50) NOT NULL,
	"lokasi" varchar(100) NOT NULL,
	"tgl_audit" timestamp NOT NULL,
	"foto_url" varchar(500),
	CONSTRAINT "dkm_inventaris_kode_barang_unique" UNIQUE("kode_barang")
);
--> statement-breakpoint
CREATE TABLE "dkm_jadwal_petugas" (
	"id" serial PRIMARY KEY NOT NULL,
	"hari" varchar(50) NOT NULL,
	"waktu" varchar(50) NOT NULL,
	"jenis_tugas" varchar(50) NOT NULL,
	"nama_petugas" varchar(150) NOT NULL,
	"kontak" varchar(50),
	"status_konfirmasi" varchar(50) DEFAULT 'Menunggu Konfirmasi',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dkm_piket_kebersihan" (
	"id" serial PRIMARY KEY NOT NULL,
	"tanggal" timestamp NOT NULL,
	"zona_area" varchar(100) NOT NULL,
	"penanggung_jawab" varchar(150) NOT NULL,
	"checklist_tugas" text,
	"status_kebersihan" varchar(50) DEFAULT 'Belum Selesai'
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"period_id" integer NOT NULL,
	"division_id" integer,
	"program_id" integer,
	"name" varchar(255) NOT NULL,
	"date" timestamp,
	"time" varchar(255),
	"location" varchar(255),
	"description" text,
	"cover_image" varchar(500),
	"status" "event_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "galleries" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"division_id" integer NOT NULL,
	"period_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"cover_image" varchar(500),
	"status" "gallery_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"gallery_id" integer NOT NULL,
	"image_url" varchar(500) NOT NULL,
	"public_id" varchar(255) NOT NULL,
	"format" varchar(50),
	"bytes" integer,
	"width" integer,
	"height" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kader_database" (
	"id" serial PRIMARY KEY NOT NULL,
	"nim" varchar(50) NOT NULL,
	"nama" varchar(150) NOT NULL,
	"prodi_angkatan" varchar(100),
	"gender" varchar(20),
	"no_wa" varchar(50),
	"divisi" varchar(100),
	"status_kaderisasi" varchar(100),
	"skills" text,
	CONSTRAINT "kader_database_nim_unique" UNIQUE("nim")
);
--> statement-breakpoint
CREATE TABLE "kader_mentoring_absensi" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama_halaqah" varchar(150) NOT NULL,
	"mentor" varchar(150) NOT NULL,
	"tanggal" timestamp NOT NULL,
	"materi" varchar(255),
	"daftar_hadir" text,
	"evaluasi" text
);
--> statement-breakpoint
CREATE TABLE "kominfo_content_planner" (
	"id" serial PRIMARY KEY NOT NULL,
	"judul_konten" varchar(255) NOT NULL,
	"platform" varchar(100) NOT NULL,
	"format" varchar(100),
	"pic" varchar(150),
	"status" varchar(50) DEFAULT 'Draft',
	"tanggal_posting" timestamp
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(255) NOT NULL,
	"secure_url" varchar(500) NOT NULL,
	"format" varchar(50),
	"width" integer,
	"height" integer,
	"bytes" integer,
	"folder" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" serial PRIMARY KEY NOT NULL,
	"period_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"nim" varchar(50),
	"email" varchar(255),
	"contact" varchar(50),
	"position_id" integer NOT NULL,
	"division_id" integer,
	"photo_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pensos_kajian_kelas" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama_kelas" varchar(150) NOT NULL,
	"kategori" varchar(100),
	"level" varchar(50),
	"no_pertemuan" integer,
	"deskripsi_materi" text,
	"link_file" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "pensos_kegiatan_sosial" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama_agenda" varchar(255) NOT NULL,
	"tanggal" timestamp NOT NULL,
	"total_anggaran" varchar(150),
	"target_lokasi" varchar(255),
	"jumlah_penerima" integer,
	"pic" varchar(150),
	"status_lpj" varchar(50) DEFAULT 'Belum Selesai'
);
--> statement-breakpoint
CREATE TABLE "pensos_kunjungan_tokoh" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama_tokoh" varchar(255) NOT NULL,
	"kategori" varchar(100) NOT NULL,
	"tanggal" timestamp NOT NULL,
	"tujuan" text NOT NULL,
	"hasil_kunjungan" text,
	"pic" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'Terjadwal' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pensos_relasi_fsldk" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama_kampus" varchar(255) NOT NULL,
	"level_wilayah" varchar(100),
	"nama_humas" varchar(150),
	"no_telp" varchar(50),
	"agenda_kolaborasi" text
);
--> statement-breakpoint
CREATE TABLE "periods" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_recruitment_open" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"level" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"image_url" varchar(255),
	"order_index" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'PUBLISHED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"period_id" integer NOT NULL,
	"division_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255),
	"description" text,
	"objective" text,
	"schedule" varchar(255),
	"status" "program_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "programs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "recruitment_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"recruitment_id" integer NOT NULL,
	"old_status" "recruitment_status",
	"new_status" "recruitment_status" NOT NULL,
	"changed_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recruitments" (
	"id" serial PRIMARY KEY NOT NULL,
	"period_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"nim" varchar(50) NOT NULL,
	"study_program" varchar(255),
	"semester" integer,
	"whatsapp" varchar(50),
	"email" varchar(255),
	"interested_division_id" integer,
	"reason" text,
	"photo_url" varchar(500),
	"status" "recruitment_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "period_nim_idx" UNIQUE("period_id","nim")
);
--> statement-breakpoint
CREATE TABLE "running_texts" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seni_olahraga_agenda" (
	"id" serial PRIMARY KEY NOT NULL,
	"topik_latihan" varchar(255) NOT NULL,
	"kategori" varchar(100) NOT NULL,
	"jadwal" timestamp NOT NULL,
	"lokasi" varchar(255),
	"pemateri" varchar(150),
	"target_peserta" varchar(150),
	"status" varchar(50) DEFAULT 'Terjadwal'
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_name" varchar(255) DEFAULT 'LDK Al-Hidayah' NOT NULL,
	"logo_url" varchar(500) DEFAULT '/logo-stmik.png',
	"description" text DEFAULT 'Unit Kegiatan Mahasiswa tingkat Institut yang bergerak di bidang kerohanian Islam, bertujuan untuk mewujudkan kampus madani.',
	"address" text DEFAULT 'Gedung Student Center STMIK IKMI CIREBON',
	"email" varchar(255) DEFAULT 'halo@ldkalhidayah.com',
	"instagram_url" varchar(500),
	"youtube_url" varchar(500),
	"tiktok_url" varchar(500),
	"facebook_url" varchar(500),
	"vercel_badge_url" varchar(1000),
	"popup_enabled" boolean DEFAULT false NOT NULL,
	"popup_image" varchar(500),
	"popup_duration" integer DEFAULT 10 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'super_admin' NOT NULL,
	"division_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_division_id_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_acknowledgments" ADD CONSTRAINT "announcement_acknowledgments_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_acknowledgments" ADD CONSTRAINT "announcement_acknowledgments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_division_id_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_period_id_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_period_id_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_division_id_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_division_id_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_period_id_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_period_id_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_division_id_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_period_id_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_division_id_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitment_logs" ADD CONSTRAINT "recruitment_logs_recruitment_id_recruitments_id_fk" FOREIGN KEY ("recruitment_id") REFERENCES "public"."recruitments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitment_logs" ADD CONSTRAINT "recruitment_logs_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitments" ADD CONSTRAINT "recruitments_period_id_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitments" ADD CONSTRAINT "recruitments_interested_division_id_divisions_id_fk" FOREIGN KEY ("interested_division_id") REFERENCES "public"."divisions"("id") ON DELETE no action ON UPDATE no action;