from app import create_app
from extensions import db
from models import User

app = create_app()

with app.app_context():
    # Student
    student = User.query.filter_by(id="S01").first()
    if not student:
        print("Creating S01...")
        student = User(id="S01", name="John Doe", email="john@example.com", role="student")
        db.session.add(student)
    
    print("Resetting S01 password to '123'...")
    student.set_password("123")

    # Teacher
    teacher = User.query.filter_by(id="T01").first()
    if not teacher:
        print("Creating T01...")
        teacher = User(id="T01", name="Professor Smith", email="smith@example.com", role="teacher")
        db.session.add(teacher)

    print("Resetting T01 password to 'admin'...")
    teacher.set_password("admin")

    db.session.commit()
    print("Passwords reset successfully!")
