"""
Script to register purchase tracking routes in app.py
"""
import sys

# Read the file
with open('d:/3Dmodel/api/app.py', encoding='utf-8') as f:
    lines = f.readlines()

# Find where Fashion IQ routes are registered and add purchase routes after
registration_code = """# Register Purchase Tracking routes
try:
    from purchase_routes import register_purchase_routes
    register_purchase_routes(app, get_session)
    logger.info("Purchase tracking routes registered successfully")
except Exception as e:
    logger.warning(f"Could not register purchase tracking routes: {e}")

"""

# Look for Fashion IQ route registration or CORS middleware
for i, line in enumerate(lines):
    if 'Fashion IQ routes registered successfully' in line:
        # Add purchase routes after Fashion IQ routes
        # Find the next blank line after the try-except block
        j = i + 1
        while j < len(lines) and lines[j].strip() != '':
            j += 1

        # Check if purchase routes aren't already registered
        if 'register_purchase_routes' not in ''.join(lines):
            lines.insert(j + 1, '\n' + registration_code)

            with open('d:/3Dmodel/api/app.py', 'w', encoding='utf-8') as f:
                f.writelines(lines)

            print("SUCCESS: Registered purchase tracking routes in app.py")
            sys.exit(0)
        else:
            print("INFO: Purchase routes already registered")
            sys.exit(0)

print("ERROR: Could not find Fashion IQ registration point")
sys.exit(1)

