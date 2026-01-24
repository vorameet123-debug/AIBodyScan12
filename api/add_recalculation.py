"""
Script to add automatic Fashion IQ recalculation to fit_check_history_helper.py
"""
import sys

# Read the file
with open('d:/3Dmodel/api/fit_check_history_helper.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the return True line and add recalculation before it
old_code = '''        logger.info(f"✅ Saved fit check history for user {user_id}: {garment_analysis.get('garment_type')} size {size if size else size_analysis['recommended_size']} (score: {fit_meters_result.get('overall_fit_score', 0)})")
        return True'''

new_code = '''        logger.info(f"✅ Saved fit check history for user {user_id}: {garment_analysis.get('garment_type')} size {size if size else size_analysis['recommended_size']} (score: {fit_meters_result.get('overall_fit_score', 0)})")
        
        # Automatically recalculate Fashion IQ score
        try:
            from integrations.fashion_iq_calculator import FashionIQCalculator
            calculator = FashionIQCalculator(session)
            iq_data = calculator.calculate_overall_iq(user_id)
            calculator.save_iq_score(user_id, iq_data)
            logger.info(f"Recalculated Fashion IQ for user {user_id}: {iq_data['overall_score']} ({iq_data['level']})")
        except Exception as calc_error:
            logger.warning(f"Failed to recalculate Fashion IQ: {calc_error}")
        
        return True'''

if old_code in content:
    content = content.replace(old_code, new_code)
    with open('d:/3Dmodel/api/fit_check_history_helper.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Added automatic Fashion IQ recalculation")
    sys.exit(0)
else:
    print("ERROR: Could not find the code to replace")
    sys.exit(1)
