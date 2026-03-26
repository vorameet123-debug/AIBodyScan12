"""
Script to add purchase tracking fields to FitCheckHistory model
"""
import sys

# Read the file
with open('d:/3Dmodel/api/fashion_iq_models.py', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line with "purchased: bool" and add new fields after it
for i, line in enumerate(lines):
    if 'purchased: bool = Field(default=False)' in line and 'purchase_intent' not in ''.join(lines[i:i+3]):
        # Add the new fields after the purchased line
        indent = '    '
        new_lines = [
            f'{indent}purchase_intent: Optional[str] = Field(default=None, max_length=10)  # "yes", "maybe", "no"\n',
            f'{indent}purchased_at: Optional[datetime] = Field(default=None)  # When marked as purchased\n'
        ]

        # Insert after the purchased line
        lines[i+1:i+1] = new_lines

        # Write back
        with open('d:/3Dmodel/api/fashion_iq_models.py', 'w', encoding='utf-8') as f:
            f.writelines(lines)

        print("SUCCESS: Added purchase tracking fields to FitCheckHistory model")
        sys.exit(0)

print("INFO: Fields might already exist or pattern not found")
sys.exit(0)

