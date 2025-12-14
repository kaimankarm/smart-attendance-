from datetime import datetime
from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(50), primary_key=True)  # e.g., "S01", "T01"
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student', 'teacher'
    profile_image = db.Column(db.Text, nullable=True)  # Base64 or path
    face_encoding = db.Column(db.Text, nullable=True) # JSON string of embedding
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "profile_image": self.profile_image
        }

class Lecture(db.Model):
    __tablename__ = 'lectures'
    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(100), nullable=False)
    teacher_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)

    teacher = db.relationship('User', backref='lectures')

    def to_dict(self):
        return {
            "id": self.id,
            "subject": self.subject,
            "teacher_id": self.teacher_id,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "is_active": self.is_active
        }

class Attendance(db.Model):
    __tablename__ = 'attendance'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    lecture_id = db.Column(db.Integer, db.ForeignKey('lectures.id'), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default="Present") # Present, Late, Absent
    confidence = db.Column(db.Float, nullable=True)
    is_spoof = db.Column(db.Boolean, default=False)
    gps_lat = db.Column(db.Float, nullable=True)
    gps_lon = db.Column(db.Float, nullable=True)
    distance = db.Column(db.Float, nullable=True)
    captured_image = db.Column(db.Text, nullable=True) # Base64 or path

    student = db.relationship('User', backref='attendance_records')
    lecture = db.relationship('Lecture', backref='attendance_records')

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "student_name": self.student.name if self.student else "Unknown",
            "timestamp": self.timestamp.isoformat(),
            "status": self.status,
            "distance": self.distance,
            "gps": {"lat": self.gps_lat, "lon": self.gps_lon}
        }

class Announcement(db.Model):
    __tablename__ = 'announcements'
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    teacher = db.relationship('User', backref='announcements')

    def to_dict(self):
        return {
            "id": self.id,
            "teacher_name": self.teacher.name if self.teacher else "Admin",
            "message": self.message,
            "timestamp": self.timestamp.isoformat()
        }

class Quiz(db.Model):
    __tablename__ = 'quizzes'
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    questions = db.Column(db.JSON, nullable=False) # List of {question, options, answer}
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "questions": self.questions,
            "is_active": self.is_active
        }

class QuizResult(db.Model):
    __tablename__ = 'quiz_results'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    student_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('User', backref='quiz_results')
    quiz = db.relationship('Quiz', backref='results')

    def to_dict(self):
        return {
            "id": self.id,
            "quiz_title": self.quiz.title if self.quiz else "Unknown",
            "score": self.score,
            "total": self.total_questions,
            "timestamp": self.timestamp.isoformat()
        }

class LeaveRequest(db.Model):
    __tablename__ = 'leave_requests'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default="Pending") # Pending, Approved, Rejected
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('User', backref='leave_requests')

    def to_dict(self):
        return {
            "id": self.id,
            "student_name": self.student.name if self.student else "Unknown",
            "reason": self.reason,
            "status": self.status,
            "timestamp": self.timestamp.isoformat()
        }
