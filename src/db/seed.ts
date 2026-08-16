import { db } from "./index";
import { users, periods, divisions, positions, members } from "./schema";
import { hash } from "bcryptjs";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function seed() {
  console.log("Seeding database...");

  // 1. Create Period
  await db.insert(periods).values({
    name: "2026/2027",
    isActive: true,
  }).onConflictDoNothing();
  
  const allPeriods = await db.select().from(periods);
  const period = allPeriods[0];

  // 2. Create Divisions
  await db.insert(divisions).values([
    { name: "DKM", slug: "dkm", periodId: period.id, isActive: true, description: "Dewan Kemakmuran Masjid" },
    { name: "Kaderisasi", slug: "kaderisasi", periodId: period.id, isActive: true, description: "Kaderisasi dan Pembinaan" },
    { name: "Kominfo", slug: "kominfo", periodId: period.id, isActive: true, description: "Komunikasi dan Informasi" },
    { name: "Pendidikan dan Sosial", slug: "pensos", periodId: period.id, isActive: true, description: "Pendidikan dan Sosial (Pensos)" },
    { name: "Seni dan Olahraga", slug: "seni-olahraga", periodId: period.id, isActive: true, description: "Seni dan Olahraga" }
  ]).onConflictDoNothing();
  
  const allDivs = await db.select().from(divisions);
  const dkm = allDivs.find(d => d.slug === "dkm")!;
  const kaderisasi = allDivs.find(d => d.slug === "kaderisasi")!;
  const kominfo = allDivs.find(d => d.slug === "kominfo")!;
  const pensos = allDivs.find(d => d.slug === "pensos")!;
  const seni = allDivs.find(d => d.slug === "seni-olahraga")!;

  // 3. Create Positions
  await db.insert(positions).values([
    { name: "Pembina", level: 1 },
    { name: "Dewan Penasehat", level: 2 },
    { name: "Ketua Umum", level: 3 },
    { name: "Sekretaris Jenderal", level: 4 },
    { name: "Bendahara Umum", level: 5 },
    { name: "Koordinator Bidang", level: 6 },
    { name: "Anggota", level: 7 }
  ]).onConflictDoNothing();

  const allPos = await db.select().from(positions);
  const posPembina = allPos.find(p => p.name === "Pembina")!;
  const posPenasehat = allPos.find(p => p.name === "Dewan Penasehat")!;
  const posKetua = allPos.find(p => p.name === "Ketua Umum")!;
  const posSekjen = allPos.find(p => p.name === "Sekretaris Jenderal")!;
  const posBendum = allPos.find(p => p.name === "Bendahara Umum")!;
  const posKoor = allPos.find(p => p.name === "Koordinator Bidang")!;
  const posAnggota = allPos.find(p => p.name === "Anggota")!;

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
  ]).onConflictDoNothing();

  // 5. Create Users (Admins based on new RBAC)
  const accounts = [
    { name: "Muhammad Luqman Hakim", email: "ketua.ldk@alhidayah.ac.id", password: "SuperKetua2026!", role: "super_admin" },
    { name: "Pariz Hapis Zudin", email: "sekretaris.ldk@alhidayah.ac.id", password: "SuperSekjen2026!", role: "super_admin" },
    { name: "Bidang DKM", email: "dkm.ldk@alhidayah.ac.id", password: "DkmAlhidayah2026!", role: "admin_dkm", divisionId: dkm.id },
    { name: "Bidang Kaderisasi", email: "kaderisasi.ldk@alhidayah.ac.id", password: "KaderAlhidayah2026!", role: "admin_kaderisasi", divisionId: kaderisasi.id },
    { name: "Bidang Kominfo", email: "kominfo.ldk@alhidayah.ac.id", password: "KominfoAlhidayah2026!", role: "admin_kominfo", divisionId: kominfo.id },
    { name: "Bidang Pensos", email: "pensos.ldk@alhidayah.ac.id", password: "PensosAlhidayah2026!", role: "admin_pensos", divisionId: pensos.id },
    { name: "Bidang Seni & Olahraga", email: "senior.ldk@alhidayah.ac.id", password: "SeniOrAlhidayah2026!", role: "admin_seni_olahraga", divisionId: seni.id },
  ];

  for (const acc of accounts) {
    const pwHash = await hash(acc.password, 10);
    await db.insert(users).values({
      name: acc.name,
      email: acc.email,
      passwordHash: pwHash,
      role: acc.role as any,
      divisionId: acc.divisionId,
    }).onConflictDoNothing();
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(console.error);
