import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { getLegalDocument } from "@/lib/content/legal";

export const metadata: Metadata = {
  title: "隐私政策",
  description: "Soniva 桌面端隐私政策。",
};

export default function PrivacyPage() {
  const doc = getLegalDocument("privacy");
  return <LegalDocument source="privacy" doc={doc} />;
}
