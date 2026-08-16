import { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Catatan Pensos | Admin LDK Al-Hidayah",
};

export default function Page() {
  return <ClientPage />;
}
