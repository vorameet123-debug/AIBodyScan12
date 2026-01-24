"""
Script to add check_id to NewClothingFitCheckResponse interface
"""
import sys

# Read the file
with open('d:/3Dmodel/website/src/services/api.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the interface and add check_id
old_text = """  all_sizes?: { [size: string]: number };
  user_selected_size?: string;
}"""

new_text = """  all_sizes?: { [size: string]: number };
  user_selected_size?: string;
  check_id?: number; // ID of the saved fit check for purchase tracking
}"""

if old_text in content and 'check_id?' not in content:
    content = content.replace(old_text, new_text)
    
    with open('d:/3Dmodel/website/src/services/api.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("SUCCESS: Added check_id to NewClothingFitCheckResponse")
    sys.exit(0)
elif 'check_id?' in content:
    print("INFO: check_id already exists")
    sys.exit(0)
else:
    print("ERROR: Could not find interface")
    sys.exit(1)
