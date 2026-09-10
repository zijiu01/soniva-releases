import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { getLegalDocument } from "@/lib/content/legal";

export const metadata: Metadata = {
  title: "使用条款",
  description: "Soniva 桌面端使用条款。",
};

export default function TermsPage() {
  const doc = getLegalDocument("terms");
  return <LegalDocument source="terms" doc={doc} />;
}
