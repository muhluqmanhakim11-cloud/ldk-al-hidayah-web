import { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Kunjungan Tokoh | Admin LDK Al-Hidayah",
};

export default function Page() {
  return <ClientPage />;
}
