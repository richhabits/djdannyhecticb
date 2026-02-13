# Deploy Real Build NOW

## The Situation

✅ **Build works** - `pnpm build` creates real Vite output
❌ **Server serves placeholder** - Not the real build

## The Fix (2 Options)

### Option 1: Deploy From Your Mac (Fastest)

```bash
# 1. Build locally
pnpm build

# 2. Deploy to server
rsync -avz dist/public/ hectic@213.199.45.126:/srv/djdannyhecticb/current/public/

# 3. Reload nginx
ssh hectic@213.199.45.126 "sudo systemctl reload nginx"

# 4. Verify (should see <!doctype html>, NOT "Ready for real deploy")
curl https://djdannyhecticb.com | head -20
```

### Option 2: Server-Side Build

```bash
# SSH to server
ssh hectic@213.199.45.126

# Run deploy script
sudo /usr/local/bin/deploy-djdannyhecticb-static.sh main

# Or run the immediate deploy script
bash /path/to/repo/scripts/server/deploy-immediate.sh
```

## Verify It Worked

```bash
# Check for hashed assets on server
ssh hectic@213.199.45.126 "ls -la /srv/djdannyhecticb/current/public/assets/ | grep 'index-.*\.js'"

# Should output something like:
# -rw-rw-r-- 1 hectic hectic 2097152 Feb 13 00:55 index-B9CUUqBJ.js
```

```bash
# Check what the site returns
curl -s https://djdannyhecticb.com | head -20
```

**Should see**:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <script type="module" crossorigin src="/assets/index-B9CUUqBJ.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-CTGClNkT.css">
  </head>
```

**Should NOT see**:
- "Ready for real deploy"
- "DJDannyHecticB is coming online"

## Build Output Confirmed

The build creates:
- `dist/public/index.html` (real Vite HTML)
- `dist/public/assets/index-B9CUUqBJ.js` (2.0MB)
- `dist/public/assets/index-CTGClNkT.css` (167KB)
- 430 other asset files

This is REAL Vite output with hashed filenames.

## What Went Wrong

The deployment scripts were working, but the real build output wasn't being copied to the server.

The placeholder file was created manually and never replaced.

## Next Steps

1. Choose Option 1 or Option 2 above
2. Run the commands
3. Verify the site shows real app
4. **DONE**

No more documentation needed until site is actually live.
