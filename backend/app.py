from flask import Flask
from config import Config
from extensions import db, cors
from routes.auth import auth_bp
from routes.attendance import attendance_bp
from routes.teacher import teacher_bp
from routes.quiz import quiz_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize Extensions
    db.init_app(app)
    cors.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
    app.register_blueprint(teacher_bp, url_prefix='/api/teacher')
    app.register_blueprint(quiz_bp, url_prefix='/api/quiz')

    @app.route('/health')
    def health():
        return {"status": "ok"}, 200

    with app.app_context():
        db.create_all() # Create tables if not exist

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)