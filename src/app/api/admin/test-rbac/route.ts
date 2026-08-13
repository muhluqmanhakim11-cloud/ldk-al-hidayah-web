import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user.role;
  const userDivisionId = session.user.divisionId;

  try {
    const body = await req.json();
    const { action, targetDivisionId } = body;

    // Simulate changing own role (TEST 6)
    if (action === "CHANGE_ROLE") {
      if (userRole !== "SUPER_ADMIN") {
        return NextResponse.json({ message: "Forbidden: Only SUPER_ADMIN can change roles" }, { status: 403 });
      }
      return NextResponse.json({ message: "Role changed successfully" });
    }

    // Simulate modifying content for a specific division (TEST 4 & 5)
    if (action === "MODIFY_CONTENT") {
      if (userRole === "SUPER_ADMIN") {
        return NextResponse.json({ message: "Allowed for SUPER_ADMIN" });
      }
      if (userRole === "KETUA") {
        return NextResponse.json({ message: "Forbidden: KETUA cannot modify content directly" }, { status: 403 });
      }
      
      // ADMIN_BIDANG
      if (userDivisionId !== targetDivisionId) {
        return NextResponse.json({ message: `Forbidden: You only have access to division ${userDivisionId}` }, { status: 403 });
      }

      return NextResponse.json({ message: `Allowed: You successfully modified division ${targetDivisionId}` });
    }

    return NextResponse.json({ message: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: "Bad Request" }, { status: 400 });
  }
}
