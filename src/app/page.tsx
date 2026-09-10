import { DownloadHero } from "@/components/download-hero";
import { ReleaseTimeline } from "@/components/release-timeline";
import { getReleases } from "@/lib/content/releases";

export default function HomePage() {
  const releases = getReleases();
  return (
    <>
      <DownloadHero release={releases[0]} />
      <ReleaseTimeline releases={releases} />
    </>
  );
}
