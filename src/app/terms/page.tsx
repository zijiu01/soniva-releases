import type { Metadata } from "next";
import { TermsDocument } from "@/components/legal/terms-document";
import { getLegalDocument } from "@/lib/content/legal";

export const metadata: Metadata = {
  title: "使用条款",
  description: "Soniva 桌面端使用条款。",
};

export default function TermsPage() {
  const doc = getLegalDocument("terms");
  return <TermsDocument doc={doc} />;
}
