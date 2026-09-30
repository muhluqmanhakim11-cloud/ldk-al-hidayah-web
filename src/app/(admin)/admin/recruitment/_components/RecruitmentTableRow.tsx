"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import DeleteRecruitmentButton from "./DeleteRecruitmentButton";

type Props = {
  item: {
    id: number;
    nim: string;
    name: string;
    studyProgram: string | null;
    createdAt: Date | string;
    status: string;
    interestedDivision?: { name: string } | null;
  };
  canDelete: boolean;
};

export default function RecruitmentTableRow({ item, canDelete }: Props) {
  const router = useRouter();

  return (
    <tr
      className="hover:bg-gray-50 dark:hover:bg-slate-800/50 dark:bg-slate-950 cursor-pointer"
      onClick={() => router.push(`/admin/recruitment/${item.id}`)}
    >
      <td className="p-4 font-medium">{item.nim}</td>
      <td className="p-4">
        <div className="font-bold">{item.name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{item.studyProgram}</div>
      </td>
      <td className="p-4">{item.interestedDivision?.name || "-"}</td>
      <td className="p-4">
        {new Date(item.createdAt).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" })}
      </td>
      <td className="p-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold
            ${item.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : ""}
            ${item.status === "REVIEWED" ? "bg-blue-100 text-blue-700 dark:text-blue-400" : ""}
            ${item.status === "ACCEPTED" ? "bg-green-100 text-green-700 dark:text-green-400" : ""}
            ${item.status === "REJECTED" ? "bg-red-100 text-red-700 dark:text-red-400" : ""}
          `}
        >
          {item.status}
        </span>
      </td>
      <td className="p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/recruitment/${item.id}`}
            className="text-green-600 font-semibold hover:underline"
          >
            Detail
          </Link>
          {canDelete && <DeleteRecruitmentButton id={item.id} name={item.name} />}
        </div>
      </td>
    </tr>
  );
}
