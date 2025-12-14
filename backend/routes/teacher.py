from flask import Blueprint, request, jsonify
from models import User, Attendance, Quiz, QuizResult, Announcement, LeaveRequest, Lecture
from extensions import db
from datetime import datetime

teacher_bp = Blueprint('teacher', __name__)

@teacher_bp.route('/dashboard', methods=['GET'])
def dashboard():
    # 1. Total Students
    total_students = User.query.filter_by(role='student').count()
    
    # 2. Present Today (Unique students who marked attendance today)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    present_today = db.session.query(
        db.func.count(db.func.distinct(Attendance.student_id))
    ).filter(Attendance.timestamp >= today_start).scalar() or 0

    # 3. Active Class
    active_lecture = Lecture.query.filter_by(is_active=True).first()
    
    return jsonify({
        "total_students": total_students,
        "total_attendance": present_today, # Renamed to match UI expectation of "Present Today"
        "active_class": active_lecture.subject if active_lecture else None,
        "active_lecture_id": active_lecture.id if active_lecture else None
    })

@teacher_bp.route('/class/status', methods=['POST'])
def toggle_class_status():
    data = request.json
    subject = data.get('subject')
    action = data.get('action') # 'start' or 'end'
    teacher_id = data.get('teacher_id')

    if action == 'start':
        # Deactivate any existing active lectures
        Lecture.query.filter_by(is_active=True).update({"is_active": False})
        
        # Create or activate lecture
        lecture = Lecture(
            subject=subject,
            teacher_id=teacher_id,
            start_time=datetime.utcnow(),
            is_active=True
        )
        db.session.add(lecture)
        db.session.commit()
        return jsonify({"message": f"Class started: {subject}", "status": "active"}), 200
        
    elif action == 'end':
        Lecture.query.filter_by(is_active=True).update({"is_active": False, "end_time": datetime.utcnow()})
        db.session.commit()
        return jsonify({"message": "Class ended", "status": "inactive"}), 200
        
    return jsonify({"error": "Invalid action"}), 400

@teacher_bp.route('/announcements', methods=['POST'])
def create_announcement():
    data = request.json
    new_announcement = Announcement(
        teacher_id=data['teacher_id'],
        message=data['message']
    )
    db.session.add(new_announcement)
    db.session.commit()
    return jsonify({"message": "Announcement sent"}), 201

@teacher_bp.route('/update_attendance', methods=['POST'])
def update_attendance():
    # Logic to update attendance manually
    return jsonify({"message": "Attendance updated"}), 200
