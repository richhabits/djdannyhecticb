import { router, publicProcedure, adminProcedure } from "../_core/trpc";
import { fetchSpotifyArtistReleases, getSpotifyAlbumEmbedUrl } from "../_core/spotifyService";
import { ENV } from "../_core/env";
import { z } from "zod";
import * as db from "../db";

export interface SpotifyReleaseForImport {
  id: string;
  name: string;
  releaseDate: string;
  imageUrl?: string;
  spotifyUrl: string;
}

export const spotifyRouter = router({
  releases: publicProcedure.query(async () => {
    if (!ENV.spotifyArtistId) {
      throw new Error("SPOTIFY_ARTIST_ID not configured");
    }

    const albums = await fetchSpotifyArtistReleases(ENV.spotifyArtistId);
    return albums.map((album) => ({
      id: album.id,
      name: album.name,
      releaseDate: album.release_date,
      imageUrl: album.images[0]?.url,
      spotifyUrl: album.external_urls.spotify,
    }));
  }),

  importRelease: adminProcedure
    .input(
      z.object({
        spotifyId: z.string(),
        name: z.string(),
        imageUrl: z.string().optional(),
        spotifyUrl: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await db
        .listProducts(false)
        .then((products) => products.find((p) => p.spotifyUrl === input.spotifyUrl));

      if (existing) {
        return { success: false, message: "Release already imported" };
      }

      const product = await db.createProduct({
        name: input.name,
        type: "drop",
        price: "0",
        currency: "GBP",
        thumbnailUrl: input.imageUrl,
        spotifyUrl: input.spotifyUrl,
        isActive: true,
      });

      await db.createAuditLog({
        action: "import_spotify_release",
        entityType: "product",
        entityId: product.id,
        actorId: ctx.user?.id,
        actorName: ctx.user?.name || "Admin",
        afterSnapshot: JSON.stringify({ name: input.name, spotifyId: input.spotifyId }),
      });

      return { success: true, productId: product.id };
    }),
});
