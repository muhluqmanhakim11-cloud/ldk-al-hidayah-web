import { Metadata } from "next";
import { db } from "@/db";
import { periods, divisions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import RecruitmentForm from "@/components/public/RecruitmentForm";

export const metadata: Metadata = {
  title: "Formulir Pendaftaran",
};

export default async function RecruitmentDaftarPage() {
  const activePeriod = await db.query.periods.findFirst({
    where: eq(periods.isActive, true),
    orderBy: (p, { desc }) => [desc(p.id)],
  });

  if (!activePeriod || !activePeriod.isRecruitmentOpen) {
    redirect("/rekrutmen");
  }

  const activeDivisions = await db.query.divisions.findMany({
    where: eq(divisions.periodId, activePeriod.id),
    orderBy: [asc(divisions.name)],
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-10">
      <div className="container mx-auto px-4 lg:px-8">
        <RecruitmentForm divisions={activeDivisions} />
      </div>
    </div>
  );
}
