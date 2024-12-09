from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    cameras = relationship("Camera", back_populates="owner")
    widgets = relationship("Widget", back_populates="owner")

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    url = Column(String)
    type = Column(String)  # IP, USB, RTSP, etc.
    location = Column(String)
    status = Column(String)  # active, inactive, error
    configuration = Column(JSON)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="cameras")
    streams = relationship("Stream", back_populates="camera")

class Widget(Base):
    __tablename__ = "widgets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # camera_stream, analytics, alert, etc.
    configuration = Column(JSON)
    position = Column(JSON)  # {x, y, w, h}
    module = Column(String)  # residential, school, hospital, etc.
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="widgets")

class Stream(Base):
    __tablename__ = "streams"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"))
    status = Column(String)  # active, inactive, error
    frame_rate = Column(Integer)
    resolution = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    camera = relationship("Camera", back_populates="streams")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True, index=True)
    name = Column(String)
    class_id = Column(Integer, ForeignKey("classes.id"))
    status = Column(String)  # present, absent
    last_seen = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    class_ = relationship("Class", back_populates="students")
    attendance_records = relationship("AttendanceRecord", back_populates="student")

class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    grade = Column(String)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    camera_id = Column(Integer, ForeignKey("cameras.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    teacher = relationship("User")
    camera = relationship("Camera")
    students = relationship("Student", back_populates="class_")
    attention_records = relationship("AttentionRecord", back_populates="class_")

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(DateTime)
    status = Column(String)  # present, absent, late
    entry_time = Column(DateTime, nullable=True)
    exit_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    student = relationship("Student", back_populates="attendance_records")

class AttentionRecord(Base):
    __tablename__ = "attention_records"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"))
    timestamp = Column(DateTime)
    attention_score = Column(Integer)  # 0-100
    engagement_level = Column(Integer)  # 0-100
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    class_ = relationship("Class", back_populates="attention_records")
