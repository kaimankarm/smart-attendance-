from flask import Blueprint, request, jsonify
from models import User
from extensions import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username') # Using username as ID for now based on seed.py logic, or email
    password = data.get('password')

    user = User.query.filter_by(id=username).first()
    if not user:
        # Fallback for name check if ID not used (optional, but sticking to ID for now)
        return jsonify({"error": "Invalid credentials"}), 401

    if user.check_password(password):
        return jsonify(user.to_dict())
    
    return jsonify({"error": "Invalid credentials"}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    # Simple register for testing
    data = request.json
    if User.query.filter_by(id=data.get('id')).first():
        return jsonify({"error": "User already exists"}), 400
    
    new_user = User(
        id=data.get('id'),
        name=data.get('name'),
        role=data.get('role'),
        email=data.get('email')
    )
    new_user.set_password(data.get('password'))
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "User created"}), 201
