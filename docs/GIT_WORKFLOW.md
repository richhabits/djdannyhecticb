# Git Workflow Guide

## Overview
This document outlines the git workflow, branch strategy, and commit conventions for the djdannyhecticb project.

**Status**: Production-ready (v1.0.0)
**Last Updated**: May 2026

---

## Branch Strategy

### Main Branch Only
The project uses a **single main branch** approach:
- **`main`** - Production branch, always deployable
- No feature branches or development branches
- All changes are committed directly to `main`

### Remote Branches
Only the following remote branches are maintained:
- `origin/main` - Production code
- `origin/HEAD` - Points to main

All stale branches have been cleaned up:
- ✓ Deleted 31 branches (copilot/*, cursor/*, archaeology/*, identity/*)

---

## Commit Message Format

All commits must follow **Conventional Commits** specification.

### Format
```
type(scope): description
```

### Types
- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, missing semicolons, etc.)
- `refactor` - Code refactoring without behavior changes
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Build, dependency, or tooling changes
- `ci` - CI/CD configuration changes
- `revert` - Reverting a previous commit

### Scope (Optional)
Scope specifies what part of the codebase is affected:
- `auth`, `api`, `db`, `ui`, `s3`, `cache`, etc.

### Examples
```
feat(auth): add JWT token refresh mechanism
fix(db): handle connection timeouts gracefully
docs(readme): update deployment instructions
perf(cache): implement Redis caching for queries
chore(deps): upgrade to Next.js 14
```

### Multi-line Commits
For detailed commit messages:
```
feat(api): implement bulk user export

- Add new `/api/export` endpoint
- Support CSV and JSON formats
- Add rate limiting (100 exports/hour)
- Include audit logging

Fixes: #123
```

---

## Git Hooks

The following git hooks are configured automatically:

### Pre-commit Hook (`.git/hooks/pre-commit`)
- **Purpose**: Validate commit messages follow Conventional Commits format
- **Action**: Prevents commits with invalid messages
- **Error Message**: Shows expected format if validation fails
- **Override**: Cannot bypass (intentional for code quality)

### Pre-push Hook (`.git/hooks/pre-push`)
- **Purpose**: Validate repository state before pushing
- **Checks**:
  - No uncommitted changes
  - No merge conflict markers
  - Working directory is clean
- **Action**: Prevents pushing if checks fail
- **Override**: Cannot bypass (prevents broken pushes)

---

## Workflow Steps

### 1. Make Changes
```bash
# Edit files
nano client/component.tsx
echo "SOME_SECRET=value" > .env.local

# Stage changes
git add client/component.tsx
# Note: .env.local is automatically ignored
```

### 2. Commit Changes
```bash
# Commit with conventional message
git commit -m "feat(ui): redesign header navigation"

# If pre-commit hook rejects message:
# - Review error message
# - Update commit message to follow format
# - Try again: git commit --amend -m "fix: correct message"
```

### 3. Review Changes
```bash
# View unpushed commits
git log origin/main..HEAD --oneline

# View detailed changes
git diff origin/main

# View staged changes
git diff --cached
```

### 4. Push to Remote
```bash
# Push changes to origin/main
git push origin main

# If pre-push hook rejects push:
# - Check git status for uncommitted changes
# - Commit or stash changes
# - Check for merge conflicts
# - Try again: git push origin main
```

### 5. Verify Push
```bash
# Confirm changes are on remote
git status
# Output: "* main...origin/main" means fully synced

# View recent commits on remote
git log origin/main --oneline -10
```

---

## Common Tasks

### View Commit History
```bash
# Last 10 commits with one-line summary
git log --oneline -10

# Detailed history with changes
git log -p -5

# Graph view of branches
git log --graph --oneline --all

# Search commits by message
git log --grep="fix" --oneline
```

### Undo Changes
```bash
# Discard changes to working directory (keep commits)
git restore <file>

# Unstage staged changes
git restore --staged <file>

# Amend last commit (before pushing)
git commit --amend --no-edit

# Revert a published commit (creates new commit)
git revert <commit-hash>
```

### Tag Releases
```bash
# Create annotated tag (recommended)
git tag -a v1.0.0 -m "Production release"

# List all tags
git tag -l

# Push tags to remote
git push origin --tags

# Delete a tag locally
git tag -d v1.0.0

# Delete a tag on remote
git push origin --delete v1.0.0
```

### View Repository Status
```bash
# Current branch and file status
git status

# Verify repository integrity
git fsck

# Count commits on main
git rev-list --count main

# Show tag details
git tag -l -n1
```

---

## Release Process

### Creating a Production Release

1. **Verify Main is Ready**
   ```bash
   git status  # Should show "clean — nothing to commit"
   git log --oneline -10  # Review recent commits
   ```

2. **Create Release Tag**
   ```bash
   git tag -a v1.0.1 -m "Production release - describe changes"
   ```

3. **Push Tag and Changes**
   ```bash
   git push origin main
   git push origin --tags
   ```

4. **Verify on GitHub**
   - Check branch shows latest commit
   - Check "Releases" page shows new tag

5. **Deploy** (if using CI/CD)
   - GitHub Actions / workflow automatically triggers on tag
   - Monitor deployment logs
   - Verify in production

---

## Repository Security

### Secrets Management
- **Never commit secrets**: Use `.env.local` (in `.gitignore`)
- **Rotate regularly**: Follow `SECRETS_ROTATION_PLAN.md`
- **Audit commits**: All commits are auditable via git log

### Access Control
- **Main branch**: Protected (see GitHub settings)
- **Push access**: Requires valid SSH key
- **Tag creation**: Only on main branch

### Verification
```bash
# Check repository integrity
git fsck --full

# Verify no secrets in commits (example)
git log -p | grep -i "secret\|password\|token"

# Check all files in git
git ls-files
```

---

## Best Practices

1. **Commit Frequently**: Small, focused commits are easier to review and debug
2. **Write Clear Messages**: Use conventional commits format for consistency
3. **Keep Main Clean**: Only merge tested, working code
4. **Review Before Push**: Use `git diff origin/main` to review changes
5. **Tag Releases**: Use semantic versioning (v1.0.0, v1.1.0, v2.0.0)
6. **Don't Force Push**: Avoid `git push --force` on main branch
7. **Sync Regularly**: Pull latest changes before making new ones

---

## Troubleshooting

### Pre-commit Hook Validation Failed
```bash
# Error: Invalid commit message format
# Solution: Follow type(scope): description format
git commit --amend -m "fix(api): correct the bug"
```

### Pre-push Hook Validation Failed
```bash
# Error: Uncommitted changes detected
# Solution: Stage and commit changes
git add .
git commit -m "chore: final cleanup"
git push origin main
```

### Can't Push - Branches Diverged
```bash
# Problem: Local and remote have different histories
# Check status
git status

# Review differences
git diff origin/main

# Pull and retry (if safe)
git pull origin main
git push origin main
```

### Accidentally Pushed Wrong Commit
```bash
# Create a revert commit (safe for public history)
git revert <commit-hash>
git push origin main

# Do NOT use git reset --hard (destroys history)
```

---

## Environment Configuration

### Local Environment Variables
Never commit `.env` files. Use `.env.local` for local development:

```bash
# .env.local (not tracked by git)
DATABASE_URL=postgres://...
API_KEY=secret_key_here
```

### Automatic Gitignore
The following are automatically ignored:
- `.env`, `.env.local`, `.env.*.local`
- `node_modules/`, `.next/`, `dist/`
- `.DS_Store`, `*.log`, `.cache/`

See `.gitignore` for complete list.

---

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Semantic Versioning](https://semver.org/)

---

**Questions or Issues?** Check this guide or review recent commits with `git log --oneline -20`
