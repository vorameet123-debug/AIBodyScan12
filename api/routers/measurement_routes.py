"""
Measurement Router
Handles measurement storage, retrieval, and management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional
from loguru import logger
from pydantic import BaseModel

from db import User, MeasurementRecord, get_session
from auth import get_current_user


class SaveMeasurementRequest(BaseModel):
    name: str
    measurement_data: dict


# Create router
router = APIRouter(prefix="/api/v1/measurements", tags=["measurements"])


@router.post("/save")
def save_measurement(
    request: SaveMeasurementRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Save a measurement set with a user-provided name"""
    try:
        logger.info(f"Save measurement request from user {current_user.email}: name='{request.name}'")
        
        if not request.name or not request.name.strip():
            raise HTTPException(status_code=400, detail="Measurement name is required")
        
        if not request.measurement_data:
            raise HTTPException(status_code=400, detail="Measurement data is required")
        
        # ALLOW duplicate names to support time-series tracking
        # Each "Save" creates a new historical record for Body Tracker
        # The frontend will group these by name
        
        # Check if name already exists (just for logging/logic, not blocking)
        # existing = session.exec(...) 
        # No longer blocking duplicates
        
        record = MeasurementRecord(
            user_id=current_user.id,
            name=request.name.strip(),
            payload=request.measurement_data
        )
        session.add(record)
        session.commit()
        session.refresh(record)
        
        logger.info(f"Successfully saved measurement '{request.name}' (ID: {record.id}) for user {current_user.email}")
        
        return {
            "id": record.id,
            "name": record.name,
            "message": "Measurement saved successfully",
            "created_at": record.created_at
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error saving measurement for user {current_user.email}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save measurement: {str(e)}"
        )


@router.get("/my-measurements")
def get_my_measurements(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get all saved measurements for the current user"""
    records = session.exec(
        select(MeasurementRecord)
        .where(MeasurementRecord.user_id == current_user.id)
        .order_by(MeasurementRecord.created_at.desc())
    ).all()
    
    result = []
    for record in records:
        payload = record.payload or {}
        result.append({
            "id": record.id,
            "name": record.name or f"Measurement {record.id}",
            "measurements": payload.get("measurements", {}),
            "size_recommendations": payload.get("size_recommendations"),
            "metadata": payload.get("metadata"),
            "created_at": record.created_at.isoformat(),
        })
    
    return {"measurements": result, "count": len(result)}


@router.get("/{measurement_id}")
def get_measurement(
    measurement_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get a specific measurement by ID"""
    record = session.exec(
        select(MeasurementRecord).where(
            MeasurementRecord.id == measurement_id,
            MeasurementRecord.user_id == current_user.id
        )
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Measurement not found")
    
    payload = record.payload or {}
    return {
        "id": record.id,
        "name": record.name or f"Measurement {record.id}",
        "measurements": payload.get("measurements", {}),
        "size_recommendations": payload.get("size_recommendations"),
        "metadata": payload.get("metadata"),
        "model_3d": payload.get("model_3d"),
        "created_at": record.created_at.isoformat(),
    }


@router.put("/{measurement_id}")
def update_measurement(
    measurement_id: int,
    request: SaveMeasurementRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Update an existing measurement"""
    try:
        logger.info(f"Update measurement request from user {current_user.email}: ID={measurement_id}, name='{request.name}'")
        
        # Find the existing record
        record = session.exec(
            select(MeasurementRecord).where(
                MeasurementRecord.id == measurement_id,
                MeasurementRecord.user_id == current_user.id
            )
        ).first()
        
        if not record:
            raise HTTPException(status_code=404, detail="Measurement not found")
        
        # Validate input
        if not request.name or not request.name.strip():
            raise HTTPException(status_code=400, detail="Measurement name is required")
        
        if not request.measurement_data:
            raise HTTPException(status_code=400, detail="Measurement data is required")
        
        # Check if the new name conflicts with another measurement (excluding current one)
        if request.name.strip() != record.name:
            existing = session.exec(
                select(MeasurementRecord).where(
                    MeasurementRecord.user_id == current_user.id,
                    MeasurementRecord.name == request.name.strip(),
                    MeasurementRecord.id != measurement_id
                )
            ).first()
            
            if existing:
                raise HTTPException(
                    status_code=400,
                    detail=f"A measurement with the name '{request.name}' already exists. Please choose a different name."
                )
        
        # Update the record
        record.name = request.name.strip()
        record.payload = request.measurement_data
        
        session.add(record)
        session.commit()
        session.refresh(record)
        
        logger.info(f"Successfully updated measurement '{request.name}' (ID: {record.id}) for user {current_user.email}")
        
        return {
            "id": record.id,
            "name": record.name,
            "message": "Measurement updated successfully",
            "updated_at": record.created_at  # Note: We don't have updated_at field, using created_at
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error updating measurement {measurement_id} for user {current_user.email}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update measurement: {str(e)}"
        )


@router.delete("/{measurement_id}")
def delete_measurement(
    measurement_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Delete a measurement"""
    record = session.exec(
        select(MeasurementRecord).where(
            MeasurementRecord.id == measurement_id,
            MeasurementRecord.user_id == current_user.id
        )
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="Measurement not found")
    
    session.delete(record)
    session.commit()
    
    logger.info(f"Deleted measurement {measurement_id} for user {current_user.email}")
    
    return {"message": "Measurement deleted successfully"}
