import { db } from "@/db";
import { activityLogs } from "@/db/schema";
import { auth } from "@/auth";

type LogActivityParams = {
  action: "CREATE" | "UPDATE" | "DELETE";
  entityType: string;
  entityName: string;
  details?: string;
  divisionId?: number | null;
};

export async function logActivity(params: LogActivityParams) {
  try {
    const session = await auth();
    if (!session || !session.user) return;

    // Use divisionId from params if provided, otherwise from user
    const divId = params.divisionId ?? (session.user.divisionId || null);

    await db.insert(activityLogs).values({
      userId: Number(session.user.id),
      divisionId: divId,
      action: params.action,
      entityType: params.entityType,
      entityName: params.entityName,
      details: params.details,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw, we don't want to break the main request
  }
}
