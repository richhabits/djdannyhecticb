
import os

COPYRIGHT_HEADER = """/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

"""

directory = "client/src/pages"

for filename in os.listdir(directory):
    if filename.endswith(".tsx"):
        filepath = os.path.join(directory, filename)
        with open(filepath, "r") as f:
            content = f.read()
        
        if "COPYRIGHT NOTICE" not in content:
            with open(filepath, "w") as f:
                f.write(COPYRIGHT_HEADER + content)
            print(f"Added header to {filename}")
        else:
            print(f"Header already exists in {filename}")
