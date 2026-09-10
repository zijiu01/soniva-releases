import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DevlogDetail } from "@/components/devlog-detail";
import { getDevlogPost, getDevlogPosts, readDevlogBody } from "@/lib/content/devlog";

export function generateStaticParams() {
  return getDevlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getDevlogPost(slug);
  if (!post) return {};
  return { title: post.titleZh };
}

export default async function DevlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getDevlogPost(slug);
  if (!post) notFound();
  return (
    <DevlogDetail
      post={post}
      bodies={{
        "zh-CN": readDevlogBody(slug, "zh-CN"),
        "en-US": readDevlogBody(slug, "en-US"),
      }}
    />
  );
}
