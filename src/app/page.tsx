import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { FeatureGrid } from "@/components/feature-grid";
import { PipelineStatus } from "@/components/pipeline-status";
import { DownloadPanel } from "@/components/download-panel";
import { ReleaseTimeline } from "@/components/release-timeline";
import { Faq } from "@/components/faq";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <FeatureGrid />
        <PipelineStatus />
        <DownloadPanel />
        <ReleaseTimeline />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
