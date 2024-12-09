from datetime import datetime
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.sql_models import Student, Class, AttendanceRecord, AttentionRecord
from .websocket_service import manager
import logging

logger = logging.getLogger(__name__)

class SchoolService:
    def __init__(self, db: Session):
        self.db = db

    async def process_attendance(self, class_id: int, detected_students: List[Dict]):
        """Process attendance based on detected students in the video feed"""
        try:
            # Get all students in the class
            class_students = self.db.query(Student).filter(Student.class_id == class_id).all()
            current_time = datetime.utcnow()

            for student in class_students:
                # Check if student was detected
                detected = any(d['student_id'] == student.student_id for d in detected_students)
                
                # Update student status
                student.status = 'present' if detected else 'absent'
                if detected:
                    student.last_seen = current_time

                # Create attendance record
                attendance_record = AttendanceRecord(
                    student_id=student.id,
                    date=current_time.date(),
                    status='present' if detected else 'absent',
                    entry_time=current_time if detected else None
                )
                self.db.add(attendance_record)

            self.db.commit()

            # Broadcast attendance update
            present_count = len([s for s in class_students if s.status == 'present'])
            absent_count = len(class_students) - present_count

            await manager.broadcast_to_module({
                'type': 'attendance_update',
                'present': present_count,
                'absent': absent_count,
                'action': 'attendance_check',
                'timestamp': current_time.isoformat()
            }, f'school_{class_id}')

        except Exception as e:
            logger.error(f"Error processing attendance: {str(e)}")
            self.db.rollback()
            raise

    async def process_attention(self, class_id: int, frame_analysis: Dict):
        """Process classroom attention analysis"""
        try:
            current_time = datetime.utcnow()
            attention_score = frame_analysis.get('attention_score', 0)
            engagement_level = frame_analysis.get('engagement_level', 0)

            # Create attention record
            attention_record = AttentionRecord(
                class_id=class_id,
                timestamp=current_time,
                attention_score=attention_score,
                engagement_level=engagement_level,
                notes=frame_analysis.get('notes')
            )
            self.db.add(attention_record)
            self.db.commit()

            # Generate alerts based on attention scores
            alerts = []
            if attention_score < 50:
                alerts.append("Low attention level detected")
            if engagement_level < 40:
                alerts.append("Critical engagement drop detected")

            # Broadcast attention update
            await manager.broadcast_to_module({
                'type': 'attention_update',
                'attention_score': attention_score,
                'engagement_level': engagement_level,
                'alerts': alerts,
                'timestamp': current_time.isoformat()
            }, f'school_{class_id}')

        except Exception as e:
            logger.error(f"Error processing attention: {str(e)}")
            self.db.rollback()
            raise

    async def get_class_statistics(self, class_id: int) -> Dict:
        """Get statistical data for a class"""
        try:
            # Get total students
            total_students = self.db.query(func.count(Student.id))\
                .filter(Student.class_id == class_id)\
                .scalar()

            # Get today's attendance
            today = datetime.utcnow().date()
            attendance = self.db.query(
                func.count(AttendanceRecord.id).label('total'),
                func.sum(case((AttendanceRecord.status == 'present', 1), else_=0)).label('present')
            ).filter(
                AttendanceRecord.date == today,
                AttendanceRecord.student_id.in_(
                    self.db.query(Student.id).filter(Student.class_id == class_id)
                )
            ).first()

            # Get average attention score for today
            attention_avg = self.db.query(func.avg(AttentionRecord.attention_score))\
                .filter(
                    AttentionRecord.class_id == class_id,
                    func.date(AttentionRecord.timestamp) == today
                )\
                .scalar()

            return {
                'total_students': total_students,
                'present_today': attendance.present or 0,
                'absent_today': total_students - (attendance.present or 0),
                'average_attention': round(attention_avg or 0, 2)
            }

        except Exception as e:
            logger.error(f"Error getting class statistics: {str(e)}")
            raise

    async def get_student_attendance_history(self, student_id: int, days: int = 30) -> List[Dict]:
        """Get attendance history for a student"""
        try:
            records = self.db.query(AttendanceRecord)\
                .filter(
                    AttendanceRecord.student_id == student_id,
                    AttendanceRecord.date >= func.current_date() - days
                )\
                .order_by(AttendanceRecord.date.desc())\
                .all()

            return [{
                'date': record.date.isoformat(),
                'status': record.status,
                'entry_time': record.entry_time.isoformat() if record.entry_time else None,
                'exit_time': record.exit_time.isoformat() if record.exit_time else None
            } for record in records]

        except Exception as e:
            logger.error(f"Error getting student attendance history: {str(e)}")
            raise
