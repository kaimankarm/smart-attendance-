from app import create_app
from models import Quiz
import json

app = create_app()

with app.app_context():
    q = Quiz.query.filter_by(is_active=True).first()
    if q:
        print(f"Title: {q.title}")
        print(f"Questions Type: {type(q.questions)}")
        print(f"Questions Content: {q.questions}")
    else:
        print("No active quiz found.")
