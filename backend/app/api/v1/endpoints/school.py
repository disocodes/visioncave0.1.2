from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from ....services.school_service import SchoolService
from ....core.deps import get_db
from datetime import datetime

router = APIRouter()

@router.get("/classes/{class_id}/statistics")
async def get_class_statistics(
    class_id: int,
    db: Session = Depends(get_db)
):
    """Get statistical data for a class"""
    school_service = SchoolService(db)
    try:
        return await school_service.get_class_statistics(class_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/students/{student_id}/attendance")
async def get_student_attendance(
    student_id: int,
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get attendance history for a student"""
    school_service = SchoolService(db)
    try:
        return await school_service.get_student_attendance_history(student_id, days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/classes/{class_id}/attendance")
async def process_class_attendance(
    class_id: int,
    detected_students: List[Dict],
    db: Session = Depends(get_db)
):
    """Process attendance for a class based on detected students"""
    school_service = SchoolService(db)
    try:
        await school_service.process_attendance(class_id, detected_students)
        return {"message": "Attendance processed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/classes/{class_id}/attention")
async def process_class_attention(
    class_id: int,
    frame_analysis: Dict,
    db: Session = Depends(get_db)
):
    """Process attention analysis for a class"""
    school_service = SchoolService(db)
    try:
        await school_service.process_attention(class_id, frame_analysis)
        return {"message": "Attention analysis processed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
