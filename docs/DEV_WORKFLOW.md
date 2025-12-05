# Developer Workflow

## Local Development Setup

### Prerequisites
- Node.js 18+
- pnpm
- MySQL database (or PlanetScale)

### Environment Variables

Create `.env` file in project root:

```env
DATABASE_URL=mysql://user:password@host:3306/database
OAUTH_SERVER_URL=http://localhost:3000
VITE_OAUTH_SERVER_URL=http://localhost:3000
VITE_APP_LOGO=/logo.png
VITE_APP_TITLE=DJ Danny Hectic B
```

### Running Development Server

```bash
# Install dependencies
pnpm install

# Run database migrations (if DATABASE_URL is set)
pnpm db:push

# Start dev server
pnpm dev
```

Server runs on `http://localhost:3000`

## Adding a New Module

### 1. Database Schema

Add table to `drizzle/schema.ts`:

```typescript
export const myTable = mysqlTable("my_table", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MyTable = typeof myTable.$inferSelect;
export type InsertMyTable = typeof myTable.$inferInsert;
```

### 2. Database Helpers

Add CRUD functions to `server/db.ts`:

```typescript
export async function createMyTable(item: InsertMyTable) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(myTable).values(item);
  const insertedId = result[0].insertId;
  const created = await db.select().from(myTable).where(eq(myTable.id, insertedId)).limit(1);
  return created[0];
}

export async function listMyTable() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(myTable).orderBy(desc(myTable.createdAt));
}
```

### 3. tRPC Router

Add router to `server/routers.ts`:

```typescript
export const appRouter = router({
  // ... existing routers
  myModule: router({
    create: publicProcedure
      .input(z.object({ name: z.string().min(1) }))
      .mutation(({ input }) => db.createMyTable(input)),
    list: publicProcedure.query(() => db.listMyTable()),
  }),
});
```

### 4. Frontend Component

Create page in `client/src/pages/MyModule.tsx`:

```typescript
import { trpc } from "@/lib/trpc";

export default function MyModule() {
  const { data, isLoading } = trpc.myModule.list.useQuery();
  // ... render UI
}
```

### 5. Add Route

Update `client/src/App.tsx`:

```typescript
<Route path="/my-module" component={MyModule} />
```

## Where to Add New Routes

### Public Routes
- Add to `client/src/App.tsx` with `<Route>` component
- Use `publicProcedure` in tRPC router

### Admin Routes
- Add to `client/src/App.tsx` with `<Route>` component
- Use `adminProcedure` in tRPC router
- Check authentication in component:

```typescript
const { user, isAuthenticated } = useAuth();
if (!isAuthenticated || user?.role !== "admin") {
  return <div>Access denied</div>;
}
```

## Queues and Cron Jobs

### Background Workers

Currently stubbed. To implement:

1. Add task queue (BullMQ recommended)
2. Create worker files in `server/workers/`
3. Register workers in `server/index.ts`

### Cron Jobs

Currently stubbed. To implement:

1. Use `node-cron` or similar
2. Create cron files in `server/cron/`
3. Register in `server/index.ts`:

```typescript
import cron from "node-cron";
cron.schedule("0 0 * * *", () => {
  // Daily task
});
```

## Type Safety

- All database types auto-generated from Drizzle schema
- tRPC provides end-to-end type safety
- Use `zod` for input validation

## Component Organization

```
client/src/
  components/
    ui/          - Base UI components (Button, Card, etc.)
    [Feature]/   - Feature-specific components
  pages/         - Route pages
  lib/           - Utilities and helpers
```

## Testing

Currently no test suite. To add:

1. Install Vitest: `pnpm add -D vitest`
2. Create tests in `__tests__/` directories
3. Run: `pnpm test`

## Deployment

### Database Migrations

```bash
# Push schema changes
pnpm db:push

# Generate migration files (if using migrations)
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### Environment Variables

Set all required env vars in production:
- `DATABASE_URL`
- `OAUTH_SERVER_URL`
- `VITE_*` variables for frontend
- `SPOTIFY_*` / `YOUTUBE_*` variables for music integrations (see README)

## Common Patterns

### Error Handling

```typescript
try {
  const result = await db.someOperation();
  return result;
} catch (error) {
  console.error("[Module] Error:", error);
  throw new Error("Operation failed");
}
```

### Audit Logging

```typescript
await db.createAuditLog({
  action: "create_item",
  entityType: "item",
  entityId: item.id,
  actorId: ctx.user?.id,
  actorName: ctx.user?.name || "Admin",
  afterSnapshot: { name: item.name },
});
```

### Toast Notifications

```typescript
import { toast } from "sonner";

toast.success("Operation completed");
toast.error("Operation failed");
```

## Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` is correct
- Verify database is accessible
- Check firewall/network settings

### Type Errors
- Run `pnpm build` to see all TypeScript errors
- Ensure all imports are correct
- Check Drizzle schema matches database

### tRPC Errors
- Check server logs for backend errors
- Verify input validation schemas
- Check authentication/authorization

