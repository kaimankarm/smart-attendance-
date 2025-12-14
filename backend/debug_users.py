from app import create_app
from extensions import db
from models import User

app = create_app()

with app.app_context():
    users = User.query.all()
    print(f"Found {len(users)} users:")
    for u in users:
        print(f"ID: {u.id}, Name: {u.name}, Role: {u.role}")
        print(f"Hash: {u.password_hash}")
        
        if u.id == "S01":
            is_valid = u.check_password("123")
            print(f"Password '123' valid? {is_valid}")
        if u.id == "T01":
            is_valid = u.check_password("admin")
            print(f"Password 'admin' valid? {is_valid}")
        print("-" * 20)
