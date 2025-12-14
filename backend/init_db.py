from app import create_app
from extensions import db
from models import User
from utils.face_recognition import get_embedding
import json
import os

app = create_app()

def enroll_user(user_id, image_path):
    if os.path.exists(image_path):
        print(f"Generating embedding for {user_id}...")
        embedding = get_embedding(image_path)
        if embedding:
            return json.dumps(embedding)
        else:
            print(f"Failed to generate embedding for {image_path}")
    else:
        print(f"Image not found: {image_path}")
    return None

with app.app_context():
    db.create_all()
    
    # Check if users exist
    student = User.query.filter_by(id="S01").first()
    if not student:
        student = User(id="S01", name="John Doe", email="john@example.com", role="student")
        student.set_password("123")
        # Try to enroll using a default image if available, otherwise leave empty
        # Assuming we have some images in 'faces/S01' from previous setup
        # For now, we'll just create the user. Enrollment can happen via API or manual update.
        db.session.add(student)
        print("Created Student: S01 / 123")
    
    # Re-enrollment check (if we need to update embeddings for existing users)
    # This is useful if we are upgrading the model and need to regenerate embeddings
    # For this demo, we will skip auto-enrollment unless we have a known path.
    
    teacher = User.query.filter_by(id="T01").first()
    if not teacher:
        teacher = User(id="T01", name="Professor Smith", email="smith@example.com", role="teacher")
        teacher.set_password("admin")
        db.session.add(teacher)
        print("Created Teacher: T01 / admin")
        
    db.session.commit()
    print("Database initialized!")
