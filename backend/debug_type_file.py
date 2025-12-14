from app import create_app
from models import Quiz
import json
import os

# Suppress TF logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

app = create_app()

with app.app_context():
    with open("debug_output.txt", "w") as f:
        q = Quiz.query.filter_by(is_active=True).first()
        if q:
            f.write(f"TYPE: {type(q.questions)}\n")
            f.write(f"VAL: {q.questions}\n")
        else:
            f.write("No active quiz found.\n")
