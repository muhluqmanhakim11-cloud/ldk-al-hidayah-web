import { db } from "./index";
import { users, periods, divisions, positions, members } from "./schema";
import { hash } from "bcryptjs";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function seed() {
  console.log("Seeding database...");

  // 1. Create Period
  const [period] = await db.insert(periods).values({
    name: "2026/2027",
    isActive: true,
  }).returning();

  // 2. Create Divisions
  const divs = await db.insert(divisions).values([
    { name: "DKM", slug: "dkm", periodId: period.id, isActive: true, description: "Dewan Kemakmuran Masjid" },
    { name: "Kaderisasi", slug: "kaderisasi", periodId: period.id, isActive: true, description: "Kaderisasi dan Pembinaan" },
    { name: "Kominfo", slug: "kominfo", periodId: period.id, isActive: true, description: "Komunikasi dan Informasi" },
    { name: "Pendidikan dan Sosial", slug: "pensos", periodId: period.id, isActive: true, description: "Pendidikan dan Sosial (Pensos)" },
    { name: "Seni dan Olahraga", slug: "seni-olahraga", periodId: period.id, isActive: true, description: "Seni dan Olahraga" }
  ]).returning();
  const dkm = divs[0];
  const kaderisasi = divs[1];
  const kominfo = divs[2];
  const pensos = divs[3];
  const seni = divs[4];

  // 3. Create Positions
  const pos = await db.insert(positions).values([
    { name: "Pembina", level: 1 },
    { name: "Dewan Penasehat", level: 2 },
    { name: "Ketua Umum", level: 3 },
    { name: "Sekretaris Jenderal", level: 4 },
    { name: "Bendahara Umum", level: 5 },
    { name: "Koordinator Bidang", level: 6 },
    { name: "Anggota", level: 7 }
  ]).returning();

  const posPembina = pos[0];
  const posPenasehat = pos[1];
  const posKetua = pos[2];
  const posSekjen = pos[3];
  const posBendum = pos[4];
  const posKoor = pos[5];
  const posAnggota = pos[6];

  // 4. Create Members
  await db.insert(members).values([
    { name: "Nana Suarna, M.Kom", periodId: period.id, positionId: posPembina.id },
    { name: "Muhammad Ahsan Al-Harits", periodId: period.id, positionId: posPenasehat.id },
    { name: "Muhammad Luqman Hakim", periodId: period.id, positionId: posKetua.id },
    { name: "Pariz Hapiz Zudin", periodId: period.id, positionId: posSekjen.id },
    { name: "Latifah", periodId: period.id, positionId: posBendum.id },
    { name: "Muhtadin", periodId: period.id, positionId: posKoor.id, divisionId: dkm.id },
    { name: "Sulistina Juliyanti", periodId: period.id, positionId: posAnggota.id, divisionId: dkm.id }, // Wait, she might be Koor too, but for seed it's fine
    { name: "Imam Hambali", periodId: period.id, positionId: posKoor.id, divisionId: kaderisasi.id },
    { name: "Jakariana", periodId: period.id, positionId: posKoor.id, divisionId: kominfo.id },
    { name: "Muhammad Ikhlasul Amal", periodId: period.id, positionId: posKoor.id, divisionId: pensos.id },
    { name: "Alfat Maulana", periodId: period.id, positionId: posKoor.id, divisionId: seni.id },
  ]);

  // 5. Create Users (Admins)
  const superAdminEmail = process.env.INITIAL_ADMIN_EMAIL || "super@test.com";
  const superAdminPassword = process.env.INITIAL_ADMIN_PASSWORD || "super123";
  const superAdminHash = await hash(superAdminPassword, 10);
  await db.insert(users).values({
    name: "Super Admin",
    email: superAdminEmail,
    passwordHash: superAdminHash,
    role: "SUPER_ADMIN",
  });

  const ketuaHash = await hash("ketua123", 10);
  await db.insert(users).values({
    name: "Muhammad Luqman Hakim",
    email: "ketua@ldkalhidayah.com",
    passwordHash: ketuaHash,
    role: "KETUA",
  });

  const dkmHash = await hash("dkm123", 10);
  await db.insert(users).values({
    name: "Muhtadin",
    email: "admin.dkm@ldkalhidayah.com",
    passwordHash: dkmHash,
    role: "ADMIN_BIDANG",
    divisionId: dkm.id,
  });

  const kominfoHash = await hash("kominfo123", 10);
  await db.insert(users).values({
    name: "Jakariana",
    email: "admin.kominfo@ldkalhidayah.com",
    passwordHash: kominfoHash,
    role: "ADMIN_BIDANG",
    divisionId: kominfo.id,
  });

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(console.error);
