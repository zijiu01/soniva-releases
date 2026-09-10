import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocDetail } from "@/components/doc-detail";
import { getDoc, getDocs, readDocBody } from "@/lib/content/docs";

export function generateStaticParams() {
  return getDocs().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return {};
  return { title: doc.titleZh };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();
  return (
    <DocDetail
      doc={doc}
      bodies={{
        "zh-CN": readDocBody(slug, "zh-CN"),
        "en-US": readDocBody(slug, "en-US"),
      }}
    />
  );
}
