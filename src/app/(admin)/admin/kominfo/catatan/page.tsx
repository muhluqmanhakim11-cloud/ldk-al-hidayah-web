import { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Catatan Kominfo | Admin LDK Al-Hidayah",
};

export default function Page() {
  return <ClientPage />;
}
