from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()
# Allow all origins, methods, and headers. Support credentials.
cors = CORS(resources={r"/*": {"origins": "*"}}, supports_credentials=True)
