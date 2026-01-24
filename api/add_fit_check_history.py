"""
Script to add the save_fit_check_history call to app.py
"""
import sys

# Read the file
with open('d:/3Dmodel/api/app.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line with "After manual add - has size_recommendation"
# and add the function call 2 lines after it
for i, line in enumerate(lines):
    if 'After manual add - has size_recommendation' in line:
        # Insert the function call after the empty line
        insert_index = i + 2  # After the logger.info and the empty line
        
        # Check if the line isn't already there
        if 'save_fit_check_history' not in lines[insert_index]:
            # Add the function call
            lines.insert(insert_index, '    save_fit_check_history(session, m_id, garment_analysis, size, size_analysis, fit_meters_result)\n')
            lines.insert(insert_index + 1, '    \n')
            print(f"SUCCESS: Added save_fit_check_history call at line {insert_index + 1}")
            
            # Write back
            with open('d:/3Dmodel/api/app.py', 'w', encoding='utf-8') as f:
                f.writelines(lines)
            print("SUCCESS: File saved successfully!")
            sys.exit(0)
        else:
            print("WARNING: Function call already exists!")
            sys.exit(0)

print("ERROR: Could not find the insertion point")
sys.exit(1)
