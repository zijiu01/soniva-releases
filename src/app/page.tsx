import { DevlogHero } from "@/components/devlog/hero";
import { TimelineView } from "@/components/devlog/timeline-view";
import { getTimelineEntries } from "@/lib/content/timeline";

export default function HomePage() {
  return (
    <>
      <DevlogHero />
      <TimelineView entries={getTimelineEntries()} />
    </>
  );
}
