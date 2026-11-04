import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recruitments, periods, divisions } from "@/db/schema";
import { eq, desc, and, ilike } from "drizzle-orm";
import { auth } from "@/auth";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || undefined;
    const periodFilter = searchParams.get("periodId") || undefined;
    const divisionFilter = searchParams.get("divisionId") || undefined;
    const searchName = searchParams.get("name") || undefined;
    const searchNim = searchParams.get("nim") || undefined;

    // Fetch target period
    let targetPeriodId: number | undefined;
    if (periodFilter) {
      targetPeriodId = parseInt(periodFilter, 10);
    } else {
      const activePeriod = await db.query.periods.findFirst({
        where: eq(periods.isActive, true),
        orderBy: (p, { desc }) => [desc(p.id)],
      });
      if (activePeriod) targetPeriodId = activePeriod.id;
    }

    const conditions = [];
    if (targetPeriodId) conditions.push(eq(recruitments.periodId, targetPeriodId));
    if (statusFilter) conditions.push(eq(recruitments.status, statusFilter as any));
    if (searchName) conditions.push(ilike(recruitments.name, `%${searchName}%`));
    if (searchNim) conditions.push(ilike(recruitments.nim, `%${searchNim}%`));

    // RBAC for division
    if (session.user.role === "ADMIN_BIDANG") {
      if (!session.user.divisionId) {
        return NextResponse.json(
          { success: false, message: "Admin bidang tidak memiliki divisi yang valid" },
          { status: 403 }
        );
      }
      conditions.push(eq(recruitments.interestedDivisionId, session.user.divisionId));
    } else if (divisionFilter) {
      conditions.push(eq(recruitments.interestedDivisionId, parseInt(divisionFilter, 10)));
    }

    const list = await db.query.recruitments.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        period: true,
        interestedDivision: true,
      },
      orderBy: [desc(recruitments.createdAt)],
    });

    // Info for header
    let periodName = "Semua Periode";
    if (targetPeriodId) {
      const p = await db.query.periods.findFirst({ where: eq(periods.id, targetPeriodId) });
      if (p) periodName = p.name;
    }

    let divisionName = "Semua Divisi";
    if (session.user.role === "ADMIN_BIDANG" && session.user.divisionId) {
      const d = await db.query.divisions.findFirst({ where: eq(divisions.id, session.user.divisionId) });
      if (d) divisionName = d.name;
    } else if (divisionFilter) {
      const d = await db.query.divisions.findFirst({ where: eq(divisions.id, parseInt(divisionFilter, 10)) });
      if (d) divisionName = d.name;
    }

    // Build Excel Workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "LDK Al-Hidayah";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Data Pendaftar", {
      views: [{ showGridLines: true }],
    });

    // Title Row
    worksheet.mergeCells("A1:K1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "DATA PENDAFTAR REKRUTMEN LDK AL-HIDAYAH";
    titleCell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF15803D" }, // Green 700
    };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 36;

    // Subtitle / Metadata Rows
    worksheet.getCell("A2").value = `Periode: ${periodName}`;
    worksheet.getCell("A2").font = { italic: true, size: 10, bold: true };

    worksheet.getCell("A3").value = `Divisi: ${divisionName} | Status: ${statusFilter || "Semua"} | Total: ${list.length} Pendaftar`;
    worksheet.getCell("A3").font = { italic: true, size: 10 };

    worksheet.getCell("A4").value = `Dicetak pada: ${new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "medium",
      timeStyle: "short",
    })} oleh ${session.user.name || "Admin"}`;
    worksheet.getCell("A4").font = { italic: true, size: 9, color: { argb: "FF6B7280" } };

    // Empty Row 5
    worksheet.getRow(5).height = 10;

    // Column widths
    worksheet.columns = [
      { key: "no", width: 6 },
      { key: "nim", width: 18 },
      { key: "name", width: 32 },
      { key: "studyProgram", width: 26 },
      { key: "semester", width: 12 },
      { key: "whatsapp", width: 20 },
      { key: "email", width: 30 },
      { key: "division", width: 26 },
      { key: "status", width: 16 },
      { key: "createdAt", width: 22 },
      { key: "reason", width: 45 },
    ];

    // Table Header (Row 6)
    const headerRow = worksheet.getRow(6);
    headerRow.values = [
      "No",
      "NIM",
      "Nama Lengkap",
      "Program Studi",
      "Semester",
      "No. WhatsApp",
      "Email",
      "Divisi Pilihan",
      "Status",
      "Tanggal Daftar",
      "Alasan Bergabung",
    ];
    headerRow.height = 28;

    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF166534" }, // Green 800
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD1D5DB" } },
        bottom: { style: "medium", color: { argb: "FF111827" } },
        left: { style: "thin", color: { argb: "FFD1D5DB" } },
        right: { style: "thin", color: { argb: "FFD1D5DB" } },
      };
    });

    // Data Rows
    if (list.length === 0) {
      const emptyRow = worksheet.addRow(["Tidak ada data pendaftar yang cocok."]);
      worksheet.mergeCells("A7:K7");
      emptyRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
      emptyRow.getCell(1).font = { italic: true, color: { argb: "FF6B7280" } };
      emptyRow.height = 24;
    } else {
      list.forEach((item, index) => {
        const formattedDate = item.createdAt
          ? new Date(item.createdAt).toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-";

        const row = worksheet.addRow([
          index + 1,
          item.nim || "-",
          (item.name || "").toUpperCase(),
          item.studyProgram || "-",
          item.semester !== null ? item.semester : "-",
          item.whatsapp || "-",
          item.email || "-",
          item.interestedDivision?.name || "-",
          item.status,
          formattedDate,
          item.reason || "-",
        ]);

        row.height = 22;

        const isEven = index % 2 === 1;
        row.eachCell((cell, colNumber) => {
          if (isEven) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF9FAFB" },
            };
          }

          cell.border = {
            top: { style: "thin", color: { argb: "FFE5E7EB" } },
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
            left: { style: "thin", color: { argb: "FFE5E7EB" } },
            right: { style: "thin", color: { argb: "FFE5E7EB" } },
          };

          if (colNumber === 1 || colNumber === 5 || colNumber === 9 || colNumber === 10) {
            cell.alignment = { horizontal: "center", vertical: "middle" };
          } else if (colNumber === 2 || colNumber === 6) {
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.numFmt = "@";
          } else if (colNumber === 11) {
            cell.alignment = { vertical: "middle", wrapText: true };
          } else {
            cell.alignment = { vertical: "middle" };
          }

          if (colNumber === 9) {
            cell.font = {
              bold: true,
              color: {
                argb:
                  item.status === "ACCEPTED"
                    ? "FF15803D"
                    : item.status === "REJECTED"
                    ? "FFDC2626"
                    : item.status === "REVIEWED"
                    ? "FF2563EB"
                    : "FFD97706",
              },
            };
          }
        });
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const cleanPeriodName = periodName.replace(/[\/\\:*?"<>|]/g, "-");
    const filename = `Data-Pendaftar-Rekrutmen-${cleanPeriodName}-${Date.now()}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting recruitments to Excel:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengekspor data ke Excel", error: String(error) },
      { status: 500 }
    );
  }
}
