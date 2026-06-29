# Go Live — Final Steps

The website (Vercel) is already live, and the **database is fully built and tested**
on Supabase (`dj-danny-hectic-b`). Only the backend (Railway) needs to be pointed at
it. Everything below is done in dashboards in your browser — **no tokens, no terminal.**

When both variables are set, Railway redeploys automatically and the site is live:
people can register, send booking enquiries, and you can upload mixes.

---

## Step 1 — Point the backend at the database

1. Go to **railway.app** → your project → the **`web`** service → **Variables** tab.
2. Add (or update) a variable named:

   ```
   DATABASE_URL
   ```

3. Set its value to your Supabase connection string. It looks like this — just swap in
   your database password where it says `YOUR-DB-PASSWORD`:

   ```
   postgresql://postgres.ujxncnmoccotlssnqzwx:YOUR-DB-PASSWORD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
   ```

   **Where to get the password / exact string:** Supabase → your project →
   **Connect** button (top of the page) → **Session pooler** → copy the URI shown.
   (If you've forgotten the password, that same screen lets you reset it.)
   Use the **Session pooler** string — it works reliably from Railway.

---

## Step 2 — Turn on mix uploads

Uploads need a Vercel Blob token. Without it the site still works, but uploading a
mix will fail.

1. In the same Railway **Variables** tab, add a variable named:

   ```
   BLOB_READ_WRITE_TOKEN
   ```

2. Get its value from: **Vercel → your `djdannyhecticb` project → Storage →
   your Blob store → `.env.local` / Tokens** → copy the `BLOB_READ_WRITE_TOKEN` value.

---

## Step 3 — Let it redeploy

Saving a variable in Railway triggers an automatic redeploy. Wait ~1–2 minutes,
then open **https://djdannyhecticb.com** and try:

- Register an account → log in
- Send a booking enquiry → it should save
- Upload a small file → it should appear in your library

---

## If the backend won't start

It's almost always one of these:

- **`JWT_SECRET` missing** — the backend needs a `JWT_SECRET` variable in Railway
  (64+ characters, with at least one uppercase letter and one number). If it isn't
  there, add one.
- **Wrong database password** in the `DATABASE_URL` above — re-copy it from the
  Supabase Connect screen.

---

### What's already been verified

- Database schema: **104 tables, 68 enums, all booking/upload/user tables, all
  auto-incrementing IDs and constraints.** A live insert test (user → booking →
  upload) passed, then was cleaned up.
- Two backend bugs were found and fixed via local testing:
  - Booking enquiries were returning a 500 (a required field was being dropped).
  - The "who am I" endpoint was leaking the password hash to the browser.
