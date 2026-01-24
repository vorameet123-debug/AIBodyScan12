"""
Script to add check_id to the fit check API response in app.py
"""
import re

# Read app.py
with open('d:/3Dmodel/api/app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Find where save_fit_check_history is called and capture the return value
# Pattern: save_fit_check_history(db, ...)
# We need to change it to: check_id = save_fit_check_history(db, ...)

# First, find the import statement
if 'from fit_check_history_helper import save_fit_check_history' not in content:
    print("ERROR: save_fit_check_history not imported")
    exit(1)

# Find the call to save_fit_check_history
pattern = r'(\s+)save_fit_check_history\(([^)]+)\)'
match = re.search(pattern, content)

if match:
    indent = match.group(1)
    params = match.group(2)
    
    # Replace with check_id = save_fit_check_history(...)
    old_call = match.group(0)
    new_call = f'{indent}check_id = save_fit_check_history({params})'
    
    content = content.replace(old_call, new_call)
    print("SUCCESS: Updated save_fit_check_history call to capture check_id")
    
    # Now find where the response is returned and add check_id to it
    # Look for return statements after the save_fit_check_history call
    # Pattern: return {...}
    
    # Find the position after the save_fit_check_history call
    pos = content.find(new_call) + len(new_call)
    
    # Find the next return statement
    return_pattern = r'return\s+\{[^}]+\}'
    return_match = re.search(return_pattern, content[pos:pos+5000])
    
    if return_match:
        return_stmt = return_match.group(0)
        # Add check_id to the return dict
        if '"check_id"' not in return_stmt and "'check_id'" not in return_stmt:
            # Find the closing brace
            new_return = return_stmt.replace('}', ',\n        "check_id": check_id\n    }')
            content = content.replace(return_stmt, new_return, 1)
            print("SUCCESS: Added check_id to response dictionary")
        else:
            print("INFO: check_id already in response")
    else:
        print("WARNING: Could not find return statement")
    
    # Write back
    with open('d:/3Dmodel/api/app.py', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("SUCCESS: Updated app.py")
else:
    print("ERROR: Could not find save_fit_check_history call")
    exit(1)
