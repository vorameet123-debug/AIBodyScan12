"""
Body Intelligence Service - Clean Version
Analyzes user's measurement history to provide insights about body changes and trends
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from sqlmodel import Session, select
from db import MeasurementRecord
from loguru import logger
import statistics


class BodyIntelligence:
    """Analyzes body measurement history and trends"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def _build_query_conditions(self, user_id: int, person_name: Optional[str] = None):
        """Build common query conditions"""
        logger.debug(f"_build_query_conditions: user_id={user_id}, person_name='{person_name}'")
        conditions = [
            MeasurementRecord.user_id == user_id,
            MeasurementRecord.user_id.isnot(None)
        ]
        if person_name:
            logger.debug(f"  Adding person_name filter: MeasurementRecord.name == '{person_name}'")
            conditions.append(MeasurementRecord.name == person_name)
        else:
            logger.debug("  No person_name filter applied")
        return conditions
    
    def _get_measurement(self, measurements: Dict, key: str) -> Optional[float]:
        """
        Get measurement value by key, checking both short and full names.
        E.g., for 'chest', checks both 'chest' and 'chest circumference'
        """
        logger.debug(f"_get_measurement called with key='{key}', available keys: {list(measurements.keys())[:5]}...")
        
        # Try exact key first
        if key in measurements and measurements[key] is not None:
            logger.debug(f"  Found exact key '{key}' = {measurements[key]}")
            return measurements[key]
        
        # Try with 'circumference' suffix
        circumference_key = f"{key} circumference"
        if circumference_key in measurements and measurements[circumference_key] is not None:
            logger.debug(f"  Found circumference key '{circumference_key}' = {measurements[circumference_key]}")
            return measurements[circumference_key]
        
        # Try with '_circumference' suffix
        underscore_key = f"{key}_circumference"
        if underscore_key in measurements and measurements[underscore_key] is not None:
            logger.debug(f"  Found underscore key '{underscore_key}' = {measurements[underscore_key]}")
            return measurements[underscore_key]
        
        logger.debug(f"  No match found for key '{key}'")
        return None
    
    def get_measurement_history(self, user_id: int, days: int = 90, person_name: Optional[str] = None) -> List[Dict]:
        """Get measurement timeline for charts"""
        cutoff = datetime.utcnow() - timedelta(days=days)
        conditions = self._build_query_conditions(user_id, person_name)
        conditions.append(MeasurementRecord.created_at >= cutoff)
        
        query = select(MeasurementRecord).where(*conditions).order_by(MeasurementRecord.created_at)
        records = self.session.exec(query).all()
        
        history = []
        for record in records:
            measurements = record.payload.get('measurements', {})
            history.append({
                'id': record.id,
                'date': record.created_at.strftime('%Y-%m-%d %H:%M'),
                'timestamp': record.created_at.timestamp(),
                'chest': self._get_measurement(measurements, 'chest'),
                'waist': self._get_measurement(measurements, 'waist'),
                'hips': self._get_measurement(measurements, 'hip'),
                'weight': self._get_measurement(measurements, 'weight'),
                'height': measurements.get('height'),
                'name': record.name
            })
        
        return history
    
    def calculate_trends(self, user_id: int, lookback: int = 5, person_name: Optional[str] = None) -> Dict:
        """Calculate measurement trends (increasing/decreasing/stable)"""
        conditions = self._build_query_conditions(user_id, person_name)
        query = select(MeasurementRecord).where(*conditions).order_by(MeasurementRecord.created_at.desc()).limit(lookback)
        records = list(reversed(self.session.exec(query).all()))
        
        if len(records) < 2:
            return {'message': 'Need at least 2 measurements to calculate trends', 'trends': {}}
        
        latest = records[-1].payload.get('measurements', {})
        oldest = records[0].payload.get('measurements', {})
        trends = {}
        
        # Map of keys to check - using 'hip' instead of 'hips' to match stored data
        keys_to_check = {
            'chest': 'chest',
            'waist': 'waist',
            'hips': 'hip',  # Note: stored as 'hip circumference'
            'weight': 'weight',
            'shoulder': 'shoulder',
            'sleeve_length': 'sleeve_length'
        }
        
        for display_key, storage_key in keys_to_check.items():
            latest_val = self._get_measurement(latest, storage_key)
            oldest_val = self._get_measurement(oldest, storage_key)
            
            if latest_val is not None and oldest_val is not None:
                change = latest_val - oldest_val
                percentage = (change / oldest_val) * 100 if oldest_val != 0 else 0
                trend = 'stable' if abs(change) < 0.5 else ('increasing' if change > 0 else 'decreasing')
                
                trends[display_key] = {
                    'change': round(change, 1),
                    'percentage': round(percentage, 1),
                    'trend': trend,
                    'latest': latest_val,
                    'oldest': oldest_val
                }
        
        return {'period': f'{len(records)} measurements', 'trends': trends}
    
    def detect_shape_changes(self, user_id: int, person_name: Optional[str] = None) -> List[str]:
        """Detect significant body shape changes"""
        trend_data = self.calculate_trends(user_id, person_name=person_name)
        trends = trend_data.get('trends', {})
        changes = []
        threshold = 2.0
        
        for measurement, data in trends.items():
            if abs(data['change']) >= threshold:
                direction = 'increased' if data['change'] > 0 else 'decreased'
                changes.append(f"{measurement.replace('_', ' ').title()} {direction} {abs(data['change'])}cm")
        
        return changes  # Return empty list if no changes, don't add placeholder message
    
    def get_comparison(self, user_id: int, measurement_id_1: int, measurement_id_2: int) -> Dict:
        """Compare two specific measurements"""
        query = select(MeasurementRecord).where(
            MeasurementRecord.user_id == user_id,
            MeasurementRecord.user_id.isnot(None),
            MeasurementRecord.id.in_([measurement_id_1, measurement_id_2])
        )
        records = {r.id: r for r in self.session.exec(query).all()}
        
        if len(records) != 2:
            return {'error': 'One or both measurements not found'}
        
        m1 = records[measurement_id_1].payload.get('measurements', {})
        m2 = records[measurement_id_2].payload.get('measurements', {})
        differences = {}
        
        for key in ['chest', 'waist', 'hips', 'weight', 'shoulder', 'sleeve_length']:
            if key in m1 and key in m2 and m1[key] and m2[key]:
                diff = m2[key] - m1[key]
                differences[key] = {
                    'before': m1[key],
                    'after': m2[key],
                    'change': round(diff, 1),
                    'percentage': round((diff / m1[key]) * 100, 1) if m1[key] != 0 else 0
                }
        
        return {
            'measurement1': {
                'id': measurement_id_1,
                'date': records[measurement_id_1].created_at.strftime('%Y-%m-%d'),
                'name': records[measurement_id_1].name
            },
            'measurement2': {
                'id': measurement_id_2,
                'date': records[measurement_id_2].created_at.strftime('%Y-%m-%d'),
                'name': records[measurement_id_2].name
            },
            'differences': differences
        }
    
    def get_latest_vs_first(self, user_id: int, person_name: Optional[str] = None) -> Dict:
        """Compare latest measurement to first measurement"""
        conditions = self._build_query_conditions(user_id, person_name)
        query = select(MeasurementRecord).where(*conditions).order_by(MeasurementRecord.created_at)
        records = self.session.exec(query).all()
        
        if len(records) < 2:
            return {'message': 'Need at least 2 measurements to compare'}
        
        return self.get_comparison(user_id, records[0].id, records[-1].id)
    
    def get_progress_summary(self, user_id: int, person_name: Optional[str] = None) -> Dict:
        """Get overall progress summary with key insights"""
        history = self.get_measurement_history(user_id, days=365, person_name=person_name)
        trends = self.calculate_trends(user_id, person_name=person_name)
        measurement_changes = self.detect_shape_changes(user_id, person_name=person_name)  # This was misnamed
        shape_changes = self.detect_shape_changes(user_id, person_name=person_name)
        
        summary = {
            'total_measurements': len(history),
            'first_measurement': history[0]['date'] if history else None,
            'latest_measurement': history[-1]['date'] if history else None,
            'trends': trends.get('trends', {}),
            'significant_changes': measurement_changes,  # Keep for backward compatibility
            'shape_changes': shape_changes,  # New field for shape transitions
            'period_analyzed': trends.get('period', 'N/A')
        }
        
        if len(history) >= 2:
            progress = self.get_latest_vs_first(user_id, person_name=person_name)
            if 'differences' in progress:
                summary['overall_progress'] = progress['differences']
        
        # Always try to classify body shape if we have at least 1 measurement
        # (body shape only needs chest, waist, hips from latest measurement)
        if len(history) >= 1:
            body_shape = self.classify_body_shape(user_id, person_name=person_name)
            # Only include if we got a valid shape (not unknown or insufficient_data)
            if body_shape.get('shape') not in ['unknown', 'insufficient_data']:
                summary['body_shape'] = body_shape
        
        # Pattern insights and velocity need 3+ measurements
        if len(history) >= 3:
            summary['pattern_insights'] = self.detect_body_patterns(user_id, person_name=person_name)
            summary['trend_velocity'] = self.calculate_trend_velocity(user_id, person_name=person_name)
        
        return summary
    
    def _classify_shape_from_measurements(self, chest: float, waist: float, hips: float) -> Dict:
        """Helper method to classify body shape from measurements"""
        waist_to_hip = waist / hips if hips > 0 else 0
        waist_to_chest = waist / chest if chest > 0 else 0
        chest_to_hip = chest / hips if hips > 0 else 0
        
        if waist_to_hip < 0.75 and chest_to_hip < 0.95:
            shape, confidence = 'hourglass', 0.9
        elif waist_to_hip < 0.75 and chest_to_hip >= 0.95:
            shape, confidence = 'pear', 0.85
        elif waist_to_hip >= 0.75 and chest_to_hip < 0.95:
            shape, confidence = 'apple', 0.85
        elif waist_to_hip >= 0.75 and chest_to_hip >= 0.95:
            shape, confidence = ('rectangle', 0.8) if abs(chest - hips) < 5 else ('inverted_triangle', 0.8)
        else:
            shape, confidence = 'athletic', 0.7
        
        return {
            'shape': shape,
            'confidence': round(confidence, 2),
            'ratios': {
                'waist_to_hip': round(waist_to_hip, 2),
                'waist_to_chest': round(waist_to_chest, 2),
                'chest_to_hip': round(chest_to_hip, 2)
            }
        }
    
    def classify_body_shape(self, user_id: int, person_name: Optional[str] = None) -> Dict:
        """Classify body shape based on measurements"""
        conditions = self._build_query_conditions(user_id, person_name)
        query = select(MeasurementRecord).where(*conditions).order_by(MeasurementRecord.created_at.desc()).limit(1)
        record = self.session.exec(query).first()
        
        # Debug logging
        logger.info(f"classify_body_shape: user_id={user_id}, person_name={person_name}")
        if record:
            logger.info(f"  Found record: id={record.id}, name='{record.name}', user_id={record.user_id}, created_at={record.created_at}")
            # Verify the record matches the person_name filter
            if person_name and record.name != person_name:
                logger.error(f"  MISMATCH: Requested person_name='{person_name}' but got record with name='{record.name}'")
                return {'shape': 'unknown', 'confidence': 0}
        else:
            logger.warning(f"  No record found for user_id={user_id}, person_name='{person_name}'")
            return {'shape': 'unknown', 'confidence': 0}
        
        measurements = record.payload.get('measurements', {})
        chest = self._get_measurement(measurements, 'chest')
        waist = self._get_measurement(measurements, 'waist')
        hips = self._get_measurement(measurements, 'hip')
        
        logger.info(f"  Measurements: chest={chest}, waist={waist}, hips={hips}")
        
        if not all([chest, waist, hips]):
            logger.warning(f"  Insufficient measurement data: chest={chest}, waist={waist}, hips={hips}")
            return {'shape': 'insufficient_data', 'confidence': 0}
        
        return self._classify_shape_from_measurements(chest, waist, hips)
    
    def detect_shape_changes(self, user_id: int, person_name: Optional[str] = None) -> List[Dict]:
        """Detect body shape changes over time"""
        conditions = self._build_query_conditions(user_id, person_name)
        query = select(MeasurementRecord).where(*conditions).order_by(MeasurementRecord.created_at)
        records = self.session.exec(query).all()
        
        shape_changes = []
        prev_shape = None
        prev_record = None
        
        for record in records:
            measurements = record.payload.get('measurements', {})
            chest = self._get_measurement(measurements, 'chest')
            waist = self._get_measurement(measurements, 'waist')
            hips = self._get_measurement(measurements, 'hip')
            
            if all([chest, waist, hips]):
                # Calculate current shape
                current_shape_data = self._classify_shape_from_measurements(chest, waist, hips)
                current_shape = current_shape_data['shape']
                
                # Detect change
                if prev_shape and prev_shape != current_shape and prev_shape not in ['unknown', 'insufficient_data']:
                    shape_changes.append({
                        'from_shape': prev_shape,
                        'to_shape': current_shape,
                        'confidence': current_shape_data['confidence'],
                        'change_date': record.created_at.strftime('%Y-%m-%d'),
                        'measurement_id': record.id,
                        'from_measurement_id': prev_record.id if prev_record else None
                    })
                
                prev_shape = current_shape
                prev_record = record
        
        return shape_changes
    
    def detect_body_patterns(self, user_id: int, person_name: Optional[str] = None) -> List[Dict]:
        """Detect body transformation patterns"""
        conditions = self._build_query_conditions(user_id, person_name)
        query = select(MeasurementRecord).where(*conditions).order_by(MeasurementRecord.created_at).limit(10)
        records = self.session.exec(query).all()
        
        if len(records) < 3:
            return [{'pattern': 'insufficient_data', 'description': 'Need at least 3 measurements to detect patterns'}]
        
        measurements_list = [r.payload.get('measurements', {}) for r in records]
        chest_series = [self._get_measurement(m, 'chest') for m in measurements_list if self._get_measurement(m, 'chest') is not None]
        waist_series = [self._get_measurement(m, 'waist') for m in measurements_list if self._get_measurement(m, 'waist') is not None]
        weight_series = [self._get_measurement(m, 'weight') for m in measurements_list if self._get_measurement(m, 'weight') is not None]
        
        patterns = []
        
        # Weight Loss Pattern
        if len(weight_series) >= 3 and weight_series[-1] < weight_series[0]:
            weight_loss = weight_series[0] - weight_series[-1]
            if weight_loss > 2:
                waist_change = waist_series[-1] - waist_series[0] if len(waist_series) >= 2 else 0
                if waist_change < -2:
                    patterns.append({
                        'pattern': 'weight_loss',
                        'description': f'Weight loss: {weight_loss:.1f}kg reduction with {abs(waist_change):.1f}cm waist decrease',
                        'confidence': 'high',
                        'change': -weight_loss
                    })
        
        # Muscle Gain Pattern
        if len(chest_series) >= 3 and chest_series[-1] > chest_series[0]:
            chest_gain = chest_series[-1] - chest_series[0]
            if chest_gain > 2:
                waist_change = waist_series[-1] - waist_series[0] if len(waist_series) >= 2 else 0
                if waist_change < 1:
                    patterns.append({
                        'pattern': 'muscle_gain',
                        'description': f'Muscle gain: {chest_gain:.1f}cm chest increase with stable waist',
                        'confidence': 'high',
                        'change': chest_gain
                    })
        
        # Body Recomposition
        if len(chest_series) >= 3 and len(waist_series) >= 3:
            chest_change = chest_series[-1] - chest_series[0]
            waist_change = waist_series[-1] - waist_series[0]
            if chest_change > 1 and waist_change < -1:
                patterns.append({
                    'pattern': 'recomposition',
                    'description': f'Body recomposition: {chest_change:.1f}cm chest increase, {abs(waist_change):.1f}cm waist decrease',
                    'confidence': 'high',
                    'change': chest_change - abs(waist_change)
                })
        
        # Stable Pattern
        if len(chest_series) >= 3:
            try:
                chest_variance = statistics.stdev(chest_series) if len(chest_series) > 1 else 0
                if chest_variance < 1.5:
                    patterns.append({
                        'pattern': 'stable',
                        'description': 'Body measurements are stable with minimal variation',
                        'confidence': 'medium',
                        'change': 0
                    })
            except statistics.StatisticsError:
                if len(set(chest_series)) == 1:
                    patterns.append({
                        'pattern': 'stable',
                        'description': 'Body measurements are completely stable',
                        'confidence': 'high',
                        'change': 0
                    })
        
        return patterns if patterns else [{'pattern': 'no_pattern', 'description': 'No clear transformation pattern detected yet', 'confidence': 'low', 'change': 0}]
    
    def calculate_trend_velocity(self, user_id: int, person_name: Optional[str] = None) -> Dict:
        """Calculate trend velocity and acceleration"""
        conditions = self._build_query_conditions(user_id, person_name)
        query = select(MeasurementRecord).where(*conditions).order_by(MeasurementRecord.created_at.desc()).limit(5)
        records = list(reversed(self.session.exec(query).all()))
        
        if len(records) < 3:
            return {'message': 'Need at least 3 measurements to calculate velocity'}
        
        velocity_data = {}
        
        # Map of keys - using 'hip' instead of 'hips' to match stored data
        keys_to_check = {
            'chest': 'chest',
            'waist': 'waist',
            'hips': 'hip',  # Note: stored as 'hip circumference'
            'weight': 'weight'
        }
        
        for display_key, storage_key in keys_to_check.items():
            values = []
            dates = []
            
            for record in records:
                measurements = record.payload.get('measurements', {})
                value = self._get_measurement(measurements, storage_key)
                if value is not None:
                    values.append(value)
                    dates.append(record.created_at)
            
            if len(values) >= 3:
                total_change = values[-1] - values[0]
                days_diff = (dates[-1] - dates[0]).days
                velocity = total_change / days_diff if days_diff > 0 else 0
                
                acceleration = 0
                if len(values) >= 4:
                    mid = len(values) // 2
                    first_velocity = (values[mid] - values[0]) / (dates[mid] - dates[0]).days if (dates[mid] - dates[0]).days > 0 else 0
                    second_velocity = (values[-1] - values[mid]) / (dates[-1] - dates[mid]).days if (dates[-1] - dates[mid]).days > 0 else 0
                    acceleration = second_velocity - first_velocity
                
                velocity_data[display_key] = {
                    'velocity': round(velocity * 30, 2),
                    'acceleration': round(acceleration * 30, 2),
                    'direction': 'increasing' if velocity > 0 else 'decreasing' if velocity < 0 else 'stable',
                    'trend': 'accelerating' if acceleration > 0.1 else 'decelerating' if acceleration < -0.1 else 'constant'
                }
        
        return velocity_data
