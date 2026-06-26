/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { router } from "@/server/_core/trpc";
import { portalProfileRouter } from "./profileRouter";
import { bookingsRouter } from "./bookingsRouter";
import { uploadsRouter } from "./uploadsRouter";
import { playlistsRouter } from "./playlistsRouter";
import { clientsRouter } from "./clientsRouter";

export const portalRouter = router({
  profile: portalProfileRouter,
  bookings: bookingsRouter,
  uploads: uploadsRouter,
  playlists: playlistsRouter,
  clients: clientsRouter,
});
