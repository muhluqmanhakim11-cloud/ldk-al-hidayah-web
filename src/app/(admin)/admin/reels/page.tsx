import { auth } from "@/auth";
import { db } from "@/db";
import { reels } from "@/db/schema";
import { desc, asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import ReelsClient from "./ReelsClient";

export const metadata = {
  title: "Kelola Reels Dakwah - Admin LDK Al-Hidayah",
};

export default async function ReelsAdminPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const initialReels = await db
    .select()
    .from(reels)
    .orderBy(asc(reels.orderIndex), desc(reels.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
            <span className="p-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </span>
            Reels Dakwah
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Kelola konten video pendek dakwah (TikTok / Reels / Shorts style) untuk jamaah dan mahasiswa.
          </p>
        </div>
      </div>

      <ReelsClient initialReels={initialReels} />
    </div>
  );
}

