import { StreamerLiveLayout } from "@/components/StreamerLiveLayout";
import { MetaTagsComponent } from "@/components/MetaTags";
import { trpc } from "@/lib/trpc";

export default function Live() {
  const { data: activeStream } = trpc.streams.active.useQuery(undefined, { retry: false });

  return (
    <>
      <MetaTagsComponent
        title="Hectic Radio - Live | DJ Danny Hectic B"
        description="Lock in with DJ Danny Hectic B on Hectic Radio. Live streaming with chat, donations, and interactive features."
        url="/live"
        type="music.radio_station"
      />
      <StreamerLiveLayout />
    </>
  );
}

