"""
Script to register wardrobe analytics routes in app.py
"""
import sys

# Read the file
with open('d:/3Dmodel/api/app.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

registration_code = """# Register Wardrobe Analytics routes
try:
    from wardrobe_routes import register_wardrobe_routes
    register_wardrobe_routes(app, get_session)
    logger.info("Wardrobe analytics routes registered successfully")
except Exception as e:
    logger.warning(f"Could not register wardrobe routes: {e}")

"""

# Find purchase routes registration and add after it
for i, line in enumerate(lines):
    if 'Purchase tracking routes registered successfully' in line:
        # Find next blank line
        j = i + 1
        while j < len(lines) and lines[j].strip() != '':
            j += 1
        
        if 'register_wardrobe_routes' not in ''.join(lines):
            lines.insert(j + 1, '\n' + registration_code)
            
            with open('d:/3Dmodel/api/app.py', 'w', encoding='utf-8') as f:
                f.writelines(lines)
            
            print("SUCCESS: Registered wardrobe analytics routes")
            sys.exit(0)
        else:
            print("INFO: Wardrobe routes already registered")
            sys.exit(0)

print("ERROR: Could not find registration point")
sys.exit(1)
