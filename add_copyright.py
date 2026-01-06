import os

COPYRIGHT_HEADER = """/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

"""

# Extensions to check
EXTENSIONS = {".tsx", ".ts", ".js", ".py", ".css", ".scss"}

# Directories to skip
SKIP_DIRS = {"node_modules", "dist", ".git", ".vite", "coverage", "build", "public"}

def add_header(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        if "COPYRIGHT NOTICE" not in content:
            # Check if file is empty
            if not content.strip():
                return
                
            # Handle shebangs
            if content.startswith("#!"):
                lines = content.splitlines()
                lines.insert(1, "")
                lines.insert(2, COPYRIGHT_HEADER.strip())
                new_content = "\n".join(lines)
            else:
                new_content = COPYRIGHT_HEADER + content
                
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Added header to {filepath}")
        else:
            # print(f"Header already exists in {filepath}")
            pass
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        # Modify dirs in-place to skip ignored directories
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        
        for file in files:
            _, ext = os.path.splitext(file)
            if ext in EXTENSIONS:
                filepath = os.path.join(root, file)
                add_header(filepath)

if __name__ == "__main__":
    print("Starting copyright header check...")
    process_directory(".")
    print("Done.")
