import { db } from './src/db';
import { users, periods, divisions, positions, siteSettings } from './src/db/schema';
import { eq, not, inArray } from 'drizzle-orm';

async function main() {
  console.log('Starting global deduplication...');
  
  // 1. users (by email)
  const allUsers = await db.select().from(users);
  const seenEmails = new Set();
  const duplicateUserIds = [];
  for (const u of allUsers) {
    if (seenEmails.has(u.email)) duplicateUserIds.push(u.id);
    else seenEmails.add(u.email);
  }
  if (duplicateUserIds.length > 0) {
    console.log(`Deleting ${duplicateUserIds.length} duplicate users...`);
    for (const id of duplicateUserIds) {
      await db.delete(users).where(eq(users.id, id));
    }
  }

  // 2. periods (by name)
  const allPeriods = await db.select().from(periods);
  const seenPeriods = new Set();
  const duplicatePeriodIds = [];
  for (const p of allPeriods) {
    if (seenPeriods.has(p.name)) duplicatePeriodIds.push(p.id);
    else seenPeriods.add(p.name);
  }
  if (duplicatePeriodIds.length > 0) {
    console.log(`Deleting ${duplicatePeriodIds.length} duplicate periods...`);
    for (const id of duplicatePeriodIds) {
      // Must ignore FK constraints if they exist, but we assume no children
      await db.delete(periods).where(eq(periods.id, id));
    }
  }

  // 3. divisions (by name + periodId)
  const allDivisions = await db.select().from(divisions);
  const seenDivs = new Set();
  const duplicateDivIds = [];
  for (const d of allDivisions) {
    const key = `${d.name}-${d.periodId}`;
    if (seenDivs.has(key)) duplicateDivIds.push(d.id);
    else seenDivs.add(key);
  }
  if (duplicateDivIds.length > 0) {
    console.log(`Deleting ${duplicateDivIds.length} duplicate divisions...`);
    for (const id of duplicateDivIds) {
      await db.delete(divisions).where(eq(divisions.id, id));
    }
  }

  // 4. positions (by name)
  const allPositions = await db.select().from(positions);
  const seenPos = new Set();
  const duplicatePosIds = [];
  for (const p of allPositions) {
    if (seenPos.has(p.name)) duplicatePosIds.push(p.id);
    else seenPos.add(p.name);
  }
  if (duplicatePosIds.length > 0) {
    console.log(`Deleting ${duplicatePosIds.length} duplicate positions...`);
    for (const id of duplicatePosIds) {
      await db.delete(positions).where(eq(positions.id, id));
    }
  }

  // 5. siteSettings (keep min ID)
  const allSettings = await db.select().from(siteSettings);
  if (allSettings.length > 1) {
    const minId = Math.min(...allSettings.map(s => s.id));
    console.log(`Deleting ${allSettings.length - 1} duplicate site settings...`);
    for (const s of allSettings) {
      if (s.id !== minId) {
        await db.delete(siteSettings).where(eq(siteSettings.id, s.id));
      }
    }
  }

  console.log('Global deduplication finished!');
}

main().catch(console.error);
