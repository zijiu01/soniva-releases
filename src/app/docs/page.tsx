import type { Metadata } from "next";
import { DocList } from "@/components/doc-list";
import { getDocs } from "@/lib/content/docs";

export const metadata: Metadata = { title: "安装与排障文档" };

export default function DocsPage() {
  return <DocList docs={getDocs()} />;
}
