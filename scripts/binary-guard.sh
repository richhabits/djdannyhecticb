#!/bin/bash
# DJ Danny Hectic B / Hectic Empire - Binary Guard
# Prevents large binaries from being committed to the repository.

MAX_SIZE_KB=2048 # 2MB Threshold
FAIL=0

echo "🛡️ Checking for large binaries in current commit..."

# Get list of files in the current commit (or changes if local)
FILES=$(git ls-files)

for FILE in $FILES; do
    if [ -f "$FILE" ]; then
        SIZE=$(du -k "$FILE" | cut -f1)
        if [ $SIZE -gt $MAX_SIZE_KB ]; then
            echo "❌ ERROR: File '$FILE' is $SIZE KB, which exceeds the limit of $MAX_SIZE_KB KB."
            FAIL=1
        fi
    fi
done

if [ $FAIL -eq 1 ]; then
    echo "⚠️ Commit blocked. Move large assets to S3/CDN or GitHub Releases."
    exit 1
else
    echo "✅ No large binaries detected."
    exit 0
fi
