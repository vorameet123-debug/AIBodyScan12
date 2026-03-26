"""
Script to update fit_check_history_helper to return check_id
"""
import sys

# Read the file
with open('d:/3Dmodel/api/fit_check_history_helper.py', encoding='utf-8') as f:
    lines = f.readlines()

# Find the return True line and change it to return the check ID
for i, line in enumerate(lines):
    if 'return True' in line and 'def save_fit_check_history' in ''.join(lines[max(0, i-30):i]):
        # Change return True to return fit_check_entry.id
        lines[i] = line.replace('return True', 'return fit_check_entry.id')

        # Also need to refresh the entry to get the ID
        # Find the session.commit() line before this
        for j in range(i-1, max(0, i-10), -1):
            if 'session.commit()' in lines[j]:
                # Add session.refresh after commit
                indent = '        '
                lines.insert(j+1, f'{indent}session.refresh(fit_check_entry)  # Get the generated ID\n')
                break

        with open('d:/3Dmodel/api/fit_check_history_helper.py', 'w', encoding='utf-8') as f:
            f.writelines(lines)

        print("SUCCESS: Updated fit_check_history_helper to return check_id")
        sys.exit(0)

print("ERROR: Could not find return True statement")
sys.exit(1)

