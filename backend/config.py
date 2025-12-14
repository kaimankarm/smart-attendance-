import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///attendance.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Face Recognition Config
    FACES_DIR = os.path.join(os.getcwd(), 'faces')
    CAMPUS_LOCATION = {"latitude": 34.0522, "longitude": -118.2437, "radius_km": 0.5} # Example: LA
