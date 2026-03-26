"""
Script to register body intelligence routes in app.py
"""
import sys

# Read app.py
with open('d:/3Dmodel/api/app.py', encoding='utf-8') as f:
    lines = f.readlines()

# Check if already registered
if any('body_intelligence_routes' in line for line in lines):
    print("INFO: Body intelligence routes already registered")
    sys.exit(0)

# Find the import section (after other route imports)
import_idx = None
for i, line in enumerate(lines):
    if 'from wardrobe_routes import register_wardrobe_routes' in line:
        import_idx = i + 1
        break

if import_idx is None:
    print("ERROR: Could not find wardrobe routes import")
    sys.exit(1)

# Add import
lines.insert(import_idx, 'from body_intelligence_routes import register_body_intelligence_routes\n')

# Find where routes are registered (after wardrobe routes)
register_idx = None
for i, line in enumerate(lines):
    if 'register_wardrobe_routes(app, get_session)' in line:
        register_idx = i + 1
        break

if register_idx is None:
    print("ERROR: Could not find wardrobe routes registration")
    sys.exit(1)

# Add registration
lines.insert(register_idx, 'register_body_intelligence_routes(app, get_session)\n')
lines.insert(register_idx + 1, 'logger.info("Body intelligence routes registered successfully")\n')

# Write back
with open('d:/3Dmodel/api/app.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("SUCCESS: Registered body intelligence routes")

