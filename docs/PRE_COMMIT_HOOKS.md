# Pre-Commit Hooks (Optional)

**Status:** Optional guidance (no required tooling)  
**Last Updated:** 2026-02-09

---

## Overview

Pre-commit hooks are Git hooks that run automatically before each commit. They can catch issues early and enforce standards.

**Note:** This is **optional** guidance. No specific tooling is required for this repository.

---

## Recommended Checks

### 1. Boundary Audit (Critical)
Ensure no boundary violations before committing:

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running boundary audit..."
if ! ./scripts/boundary-audit.sh > /dev/null 2>&1; then
  echo "❌ Boundary audit failed!"
  echo "Run: ./scripts/boundary-audit.sh"
  exit 1
fi
```

### 2. TypeScript Check
Ensure code compiles:

```bash
echo "Running TypeScript check..."
if ! pnpm check > /dev/null 2>&1; then
  echo "❌ TypeScript errors detected!"
  echo "Run: pnpm check"
  exit 1
fi
```

### 3. Forbidden String Scan
Check for forbidden project references:

```bash
echo "Scanning for forbidden strings..."
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|json)$')

if [ -n "$STAGED_FILES" ]; then
  if echo "$STAGED_FILES" | xargs grep -E "piing|hectictv|blackmoss|shadymotion" | \
     grep -v "platform.*enum" | grep -v "social.*platform"; then
    echo "❌ Found forbidden project references in staged files!"
    exit 1
  fi
fi
```

### 4. Secrets Check
Prevent committing secrets:

```bash
echo "Checking for secrets..."
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -n "$STAGED_FILES" ]; then
  # Check for common secret patterns
  if echo "$STAGED_FILES" | xargs grep -E "(api[_-]?key|secret|password|token).*=.*['\"][^'\"]{20,}" 2>/dev/null; then
    echo "⚠️  Possible secret detected in staged files!"
    echo "Review carefully before committing."
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
fi
```

---

## Manual Setup (If Desired)

### Option 1: Simple Pre-Commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Simple pre-commit hook

echo "🔍 Running pre-commit checks..."

# Boundary audit
if ! ./scripts/boundary-audit.sh > /dev/null 2>&1; then
  echo "❌ Boundary audit failed"
  exit 1
fi

# TypeScript check
if ! pnpm check > /dev/null 2>&1; then
  echo "❌ TypeScript check failed"
  exit 1
fi

echo "✅ Pre-commit checks passed"
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

### Option 2: Using Husky (Recommended for Teams)

If you want automated setup for team members:

```bash
# Install husky
pnpm add -D husky

# Initialize husky
pnpm exec husky init

# Add pre-commit hook
echo '#!/bin/sh
./scripts/boundary-audit.sh && pnpm check' > .husky/pre-commit

# Make executable
chmod +x .husky/pre-commit
```

**Note:** This requires adding husky to package.json, which we're avoiding per constraints.

### Option 3: Pre-Push Hook (Less Intrusive)

For less frequent but more thorough checks:

Create `.git/hooks/pre-push`:

```bash
#!/bin/bash
# Pre-push hook - runs before git push

echo "🚀 Running pre-push verification..."

# Run full verification
if ! ./scripts/prod-verify.sh; then
  echo "❌ Pre-push verification failed"
  echo "Fix issues before pushing to origin."
  exit 1
fi

echo "✅ Pre-push verification passed"
```

Make it executable:
```bash
chmod +x .git/hooks/pre-push
```

---

## Available Scripts for Hooks

| Script | Purpose | Speed | Recommended Phase |
|--------|---------|-------|-------------------|
| `boundary-audit.sh` | Check boundary violations | Fast (< 1s) | pre-commit |
| `pnpm check` | TypeScript check | Fast (< 5s) | pre-commit |
| `pnpm build` | Full build | Slow (20s) | pre-push |
| `prod-verify.sh` | All checks | Slow (30s) | pre-push |

---

## Team Guidance

### For Individual Developers

**Recommended minimum:**
1. Install pre-commit hook with boundary audit
2. Run `pnpm check` manually before committing
3. Run `./scripts/prod-verify.sh` before pushing

**Setup:**
```bash
# Copy sample pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "🔍 Running boundary audit..."
./scripts/boundary-audit.sh || exit 1
echo "✅ Boundary check passed"
EOF

chmod +x .git/hooks/pre-commit
```

### For Team Leads

**Consider:**
1. Document pre-commit hook setup in onboarding
2. Add to team standards/guidelines
3. Run `prod-verify.sh` in CI (already done in GitHub Actions)
4. Review commits for boundary violations during code review

### For CI/CD

**Already Implemented:**
- GitHub Actions runs boundary audit on every PR
- TypeScript check runs on every PR
- Build verification runs on every PR
- No local hooks required for CI to enforce standards

---

## Bypassing Hooks (When Necessary)

If you need to bypass hooks (e.g., WIP commit):

```bash
# Skip pre-commit hook
git commit --no-verify -m "WIP: partial work"

# Skip pre-push hook  
git push --no-verify
```

**⚠️ Warning:** Only bypass when you understand the risks. CI will still enforce checks.

---

## Troubleshooting

### Hook Not Running
```bash
# Check if hook exists
ls -la .git/hooks/pre-commit

# Check if executable
chmod +x .git/hooks/pre-commit

# Check for errors
bash -x .git/hooks/pre-commit
```

### Hook Fails Incorrectly
```bash
# Test boundary audit directly
./scripts/boundary-audit.sh

# Test TypeScript check
pnpm check

# Review errors and fix
```

### Disable Hook Temporarily
```bash
# Rename hook
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled

# Re-enable later
mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit
```

---

## Best Practices

### DO:
✅ Run boundary audit before every commit  
✅ Run TypeScript check before committing  
✅ Run full verification before pushing  
✅ Keep hooks fast (< 10 seconds)  
✅ Provide clear error messages  
✅ Allow bypass for emergencies  

### DON'T:
❌ Add slow operations to pre-commit (use pre-push instead)  
❌ Require specific tooling (keep optional)  
❌ Block commits for warnings (only errors)  
❌ Run network operations in hooks  
❌ Forget CI is the ultimate gatekeeper  

---

## Alternative: IDE Integration

Instead of Git hooks, consider IDE integration:

### VS Code

Add to `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Boundary Audit",
      "type": "shell",
      "command": "./scripts/boundary-audit.sh",
      "presentation": {
        "reveal": "always"
      }
    },
    {
      "label": "Pre-Commit Checks",
      "type": "shell",
      "command": "./scripts/boundary-audit.sh && pnpm check",
      "group": {
        "kind": "test",
        "isDefault": true
      }
    }
  ]
}
```

Run with: `Ctrl+Shift+P` → "Tasks: Run Task" → "Pre-Commit Checks"

---

## Summary

**Pre-commit hooks are optional but recommended.**

**Minimum recommended setup:**
```bash
# Create simple pre-commit hook
echo '#!/bin/bash
./scripts/boundary-audit.sh || exit 1' > .git/hooks/pre-commit

chmod +x .git/hooks/pre-commit
```

**CI enforcement (already active):**
- GitHub Actions enforces all checks
- No local hooks required for protection
- Local hooks are developer convenience only

---

**Status:** Optional guidance provided  
**Enforcement:** CI/CD (GitHub Actions)  
**Local Setup:** Developer choice
