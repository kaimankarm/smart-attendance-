from flask import Blueprint, request, jsonify
from extensions import db
from models import Quiz, QuizResult, User, Lecture
from datetime import datetime

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/create', methods=['POST'])
def create_quiz():
    data = request.json
    teacher_id = data.get('teacher_id')
    title = data.get('title')
    questions = data.get('questions') # List of dicts

    if not all([teacher_id, title, questions]):
        return jsonify({"error": "Missing required fields"}), 400

    new_quiz = Quiz(
        teacher_id=teacher_id,
        title=title,
        questions=questions,
        is_active=True
    )
    db.session.add(new_quiz)
    db.session.commit()
    return jsonify({"message": "Quiz created successfully", "quiz_id": new_quiz.id}), 201

@quiz_bp.route('/active', methods=['GET'])
def get_active_quiz():
    # In a real app, you might link this to the active lecture
    active_quiz = Quiz.query.filter_by(is_active=True).order_by(Quiz.created_at.desc()).first()
    if not active_quiz:
        return jsonify({"msg": "No active quiz"}), 404
    return jsonify(active_quiz.to_dict())

@quiz_bp.route('/submit', methods=['POST'])
def submit_quiz():
    data = request.json
    quiz_id = data.get('quiz_id')
    student_id = data.get('student_id')
    answers = data.get('answers') # List of selected indices or values

    if not all([quiz_id, student_id, answers]):
        return jsonify({"error": "Missing data"}), 400

    # 1. Check if already submitted
    existing = QuizResult.query.filter_by(quiz_id=quiz_id, student_id=student_id).first()
    if existing:
        return jsonify({"error": "You have already submitted this quiz"}), 400

    # 2. Calculate Score
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404

    score = 0
    total = len(quiz.questions)
    
    # Simple evaluation (assuming 'correct' index in question)
    # Questions structure: [{"text": "...", "options": ["A", "B"], "correct": 0}]
    for i, q in enumerate(quiz.questions):
        str_i = str(i)
        user_answer = None
        
        # Handle if answers is list or dict
        if isinstance(answers, list) and i < len(answers):
             user_answer = answers[i]
        elif isinstance(answers, dict) and str_i in answers:
             user_answer = answers[str_i]
             
        if user_answer is not None:
            # Check if answer matches correct index
            if user_answer == q.get('correct'):
                score += 1
    
    result = QuizResult(
        quiz_id=quiz_id,
        student_id=student_id,
        score=score,
        total_questions=total
    )
    db.session.add(result)
    db.session.commit()

    return jsonify({
        "message": "Quiz submitted",
        "score": score,
        "total": total
    }), 200

@quiz_bp.route('/stop/<int:quiz_id>', methods=['POST'])
def stop_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if quiz:
        quiz.is_active = False
        db.session.commit()
        return jsonify({"message": "Quiz stopped"}), 200
    return jsonify({"error": "Quiz not found"}), 404

@quiz_bp.route('/list/<teacher_id>', methods=['GET'])
def list_quizzes(teacher_id):
    quizzes = Quiz.query.filter_by(teacher_id=teacher_id).order_by(Quiz.created_at.desc()).all()
    return jsonify([{
        "id": q.id,
        "title": q.title,
        "is_active": q.is_active,
        "questions_count": len(q.questions),
        "created_at": q.created_at.isoformat()
    } for q in quizzes])

@quiz_bp.route('/delete/<int:quiz_id>', methods=['DELETE'])
def delete_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404
    
    # Optional: Delete associated results first if cascading delete isn't set up
    QuizResult.query.filter_by(quiz_id=quiz_id).delete()
    
    db.session.delete(quiz)
    db.session.commit()
    return jsonify({"message": "Quiz deleted successfully"}), 200

@quiz_bp.route('/results/<int:quiz_id>', methods=['GET'])
def get_results(quiz_id):
    results = QuizResult.query.filter_by(quiz_id=quiz_id).all()
    data = []
    for r in results:
        student = User.query.get(r.student_id)
        data.append({
            "student_name": student.name if student else "Unknown",
            "score": r.score,
            "total": r.total_questions
        })
    return jsonify(data)
