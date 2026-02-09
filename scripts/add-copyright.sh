#!/bin/bash
# Add copyright headers to all source files

set -e

COPYRIGHT_HEADER='/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */

'

find server client shared -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "*.d.ts" | while read -r file; do
  # Check if file already has copyright header
  if ! head -n 1 "$file" | grep -q "COPYRIGHT NOTICE"; then
    # Create temp file with copyright + original content
    echo "$COPYRIGHT_HEADER" > "$file.tmp"
    cat "$file" >> "$file.tmp"
    mv "$file.tmp" "$file"
    echo "Added copyright to: $file"
  fi
done

echo "Copyright headers added to source files."

