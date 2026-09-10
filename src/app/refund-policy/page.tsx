import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";
import { getLegalDocument } from "@/lib/content/legal";

export const metadata: Metadata = {
  title: "退款政策",
  description: "Soniva 桌面端退款政策。",
};

export default function RefundPolicyPage() {
  const doc = getLegalDocument("refund-policy");
  return <LegalDocument source="refund-policy" doc={doc} />;
}
