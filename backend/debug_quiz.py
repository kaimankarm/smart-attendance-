from app import create_app
from extensions import db
from models import Quiz

app = create_app()

with app.app_context():
    print("--- Checking Active Quizzes ---")
    quizzes = Quiz.query.all()
    print(f"Total Quizzes in DB: {len(quizzes)}")
    
    active_quizzes = Quiz.query.filter_by(is_active=True).all()
    print(f"Active Quizzes (is_active=True): {len(active_quizzes)}")
    
    for q in quizzes:
        print(f"ID: {q.id}, Title: {q.title}, Active: {q.is_active}, Created: {q.created_at}")
    
    # Check what the API does
    print("\n--- Simulating API Query ---")
    active_quiz_api = Quiz.query.filter_by(is_active=True).order_by(Quiz.created_at.desc()).first()
    if active_quiz_api:
        print(f"API would return Quiz ID: {active_quiz_api.id}, Title: {active_quiz_api.title}")
    else:
        print("API would return 404 (No active quiz)")
