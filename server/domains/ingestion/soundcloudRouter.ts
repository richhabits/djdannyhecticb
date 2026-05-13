import { router, publicProcedure, adminProcedure } from "../_core/trpc";
import { fetchSoundCloudTracks, normalizeSoundCloudArtworkUrl } from "../_core/soundcloudService";
import { ENV } from "../_core/env";
import * as db from "../db";

export const soundcloudRouter = router({
  tracks: publicProcedure.query(async () => {
    if (!ENV.soundcloudUserId) {
      throw new Error("SOUNDCLOUD_USER_ID not configured");
    }
    const tracks = await fetchSoundCloudTracks(ENV.soundcloudUserId);
    return tracks.map((track) => ({
      id: track.id,
      title: track.title,
      description: track.description,
      url: track.uri,
      artworkUrl: normalizeSoundCloudArtworkUrl(track.artwork_url),
    }));
  }),

  sync: adminProcedure.mutation(async ({ ctx }) => {
    if (!ENV.soundcloudUserId) {
      throw new Error("SOUNDCLOUD_USER_ID not configured");
    }

    const tracks = await fetchSoundCloudTracks(ENV.soundcloudUserId);
    let created = 0;
    let updated = 0;

    for (const track of tracks) {
      const artworkUrl = normalizeSoundCloudArtworkUrl(track.artwork_url);
      const existing = await db.listProducts(false).then((products) =>
        products.find((p) => p.soundcloudUrl === track.uri)
      );

      if (existing) {
        await db.updateProduct(existing.id, {
          soundcloudUrl: track.uri,
          thumbnailUrl: artworkUrl || existing.thumbnailUrl,
          description: track.description || existing.description,
        });
        updated++;
      } else {
        await db.createProduct({
          name: track.title,
          description: track.description,
          type: "drop",
          price: "0",
          currency: "GBP",
          thumbnailUrl: artworkUrl,
          soundcloudUrl: track.uri,
          isActive: true,
        });
        created++;
      }
    }

    await db.createAuditLog({
      action: "soundcloud_sync",
      entityType: "product",
      actorId: ctx.user?.id,
      actorName: ctx.user?.name || "Admin",
      afterSnapshot: JSON.stringify({ created, updated, totalTracks: tracks.length }),
    });

    return { created, updated, totalTracks: tracks.length };
  }),
});
