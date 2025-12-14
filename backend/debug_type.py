from app import create_app
from models import Quiz
import json

app = create_app()

with app.app_context():
    q = Quiz.query.filter_by(is_active=True).first()
    if q:
        print("RESULT_START")
        print(f"TYPE: {type(q.questions)}")
        print(f"VAL: {q.questions}")
        print("RESULT_END")
