import math
from flask import Blueprint, request, jsonify
from datetime import datetime
from models import Attendance, User, Lecture
from extensions import db
from utils.face_recognition import verify_face_logic, decode_base64_to_cv2_image, get_embedding
from config import Config
import cv2
import os
import json

attendance_bp = Blueprint('attendance', __name__)

def calculate_distance(lat1, lon1, lat2, lon2):
    if lat1 is None or lon1 is None: return 0 # Skip if no GPS
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) * math.sin(dlat / 2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dlon / 2) * math.sin(dlon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@attendance_bp.route('/mark', methods=['POST'])
def mark_attendance():
    print("DEBUG: Received attendance request")
    try:
        data = request.json
        student_id = data.get('student_id')
        image_data = data.get('image')
        lat = data.get('latitude')
        lon = data.get('longitude')

        if not all([student_id, image_data]):
             return jsonify({"error": "Missing student_id or image"}), 400

        # 1. Strict Session Check
        active_lecture = Lecture.query.filter_by(is_active=True).first()
        if not active_lecture:
             return jsonify({"error": "No class session is currently active. Attendance cannot be marked."}), 400

        # 2. Check Duplicate for THIS Session
        existing = Attendance.query.filter_by(
            student_id=student_id, 
            lecture_id=active_lecture.id
        ).first()
        
        if existing:
            # If already marked, just return success/info without errors
            return jsonify({
                "message": "Attendance already marked for this session",
                "status": existing.status,
                "timestamp": existing.timestamp.strftime("%H:%M:%S")
            }), 200

        # 3. GPS Validation (Optional)
        distance = 0
        if lat and lon:
            campus_lat = Config.CAMPUS_LOCATION["latitude"]
            campus_lon = Config.CAMPUS_LOCATION["longitude"]
            distance = calculate_distance(lat, lon, campus_lat, campus_lon)

        # 4. Face Recognition Logic
        user = User.query.get(student_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        img = decode_base64_to_cv2_image(image_data)
        if img is None:
            return jsonify({"error": "Invalid image data"}), 400
        
        if img is None:
            return jsonify({"error": "Invalid image data"}), 400
        
        # Optimization: Process in-memory without disk write
        try:
            # Auto-enrollment logic
            if not user.face_encoding:
                # DeepFace accepts numpy array
                embedding = get_embedding(img)
                if embedding:
                    user.face_encoding = json.dumps(embedding)
                    db.session.commit()
                else:
                    return jsonify({"error": "Could not detect face for enrollment."}), 400

            result = verify_face_logic(img, user)
        except Exception as e:
            return jsonify({"error": f"Face verification failed: {str(e)}"}), 500
        
        # No finally block needed as no file to clean up

        if result['status'] == 'success':
            # 5. Determine Status (Present vs Late)
            # Grace period: 5 minutes
            now = datetime.utcnow()
            start_time = active_lecture.start_time
            time_diff = now - start_time
            
            status = "Present"
            if time_diff > datetime.timedelta(minutes=5):
                status = "Late"

            new_attendance = Attendance(
                student_id=student_id,
                lecture_id=active_lecture.id,
                status=status,
                confidence=result.get('confidence', 0),
                gps_lat=lat,
                gps_lon=lon,
                distance=distance,
                timestamp=now
            )
            db.session.add(new_attendance)
            db.session.commit()
            
            return jsonify({
                "message": f"Attendance Marked! Status: {status}", 
                "status": status,
                "confidence": result.get('confidence')
            }), 200
        else:
            return jsonify({"error": result['message']}), 400

    except Exception as e:
        print(f"DEBUG: Critical Error: {e}")
        return jsonify({"error": str(e)}), 500

@attendance_bp.route('/history/<student_id>', methods=['GET'])
def get_history(student_id):
    records = Attendance.query.filter_by(student_id=student_id).order_by(Attendance.timestamp.desc()).all()
    return jsonify([r.to_dict() for r in records])

@attendance_bp.route('/stats/<student_id>', methods=['GET'])
def get_student_stats(student_id):
    results = db.session.query(
        Lecture.subject, 
        db.func.count(Attendance.id)
    ).join(Attendance).filter(Attendance.student_id == student_id).group_by(Lecture.subject).all()
    stats = [{"name": r[0], "attendance": r[1]} for r in results]
    return jsonify(stats)
