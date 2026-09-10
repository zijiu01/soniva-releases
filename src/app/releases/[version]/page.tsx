import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReleaseDetail } from "@/components/release-detail";
import { getRelease, getReleases, readReleaseBody } from "@/lib/content/releases";

export function generateStaticParams() {
  return getReleases().map((release) => ({ version: release.version }));
}

export async function generateMetadata({ params }: { params: Promise<{ version: string }> }): Promise<Metadata> {
  const { version } = await params;
  const release = getRelease(version);
  if (!release) return {};
  return { title: `v${release.version} · ${release.titleZh}` };
}

export default async function ReleasePage({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  const release = getRelease(version);
  if (!release) notFound();
  return (
    <ReleaseDetail
      release={release}
      bodies={{
        "zh-CN": readReleaseBody(version, "zh-CN"),
        "en-US": readReleaseBody(version, "en-US"),
      }}
    />
  );
}
