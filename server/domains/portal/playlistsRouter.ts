/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Playlist builder — stubbed as "Coming soon" per build order; full
 * create/reorder/cover-art flow lands in a later pass.
 */

import { router, clientProcedure } from "@/server/_core/trpc";

export const playlistsRouter = router({
  listMine: clientProcedure.query(async () => {
    return [];
  }),
});
