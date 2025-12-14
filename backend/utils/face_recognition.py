import cv2
import numpy as np
import base64
from deepface import DeepFace
from config import Config
from scipy.spatial.distance import cosine

# Singleton for models to ensure they load only once
class FaceModel:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FaceModel, cls).__new__(cls)
            cls._instance.initialize()
        return cls._instance

    def initialize(self):
        print("Loading Face Recognition Models... (RetinaFace + ArcFace)")
        # We trigger a dummy build to load weights into memory
        try:
            DeepFace.build_model("ArcFace")
            # RetinaFace is loaded on demand by DeepFace usually, but we can pre-warm it
            # by running a dummy detection if needed, but DeepFace handles caching well.
            print("Models loaded successfully.")
        except Exception as e:
            print(f"Error loading models: {e}")

# Initialize models at startup
face_model = FaceModel()

def decode_base64_to_cv2_image(data_url):
    try:
        encoded_data = data_url.split(',')[1]
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

def get_embedding(img_path_or_array):
    """
    Generate 512-dim embedding using ArcFace.
    """
    try:
        embedding_objs = DeepFace.represent(
            img_path=img_path_or_array,
            model_name="ArcFace",
            detector_backend="retinaface",
            enforce_detection=True,
            align=True
        )
        if embedding_objs and len(embedding_objs) > 0:
            return embedding_objs[0]["embedding"]
    except Exception as e:
        print(f"Error generating embedding: {e}")
    return None

def verify_face_logic(captured_image_path, user):
    """
    Verify face using ArcFace embeddings and Cosine Similarity.
    Threshold: 0.45
    """
    try:
        # 1. Get embedding for captured image
        captured_embedding = get_embedding(captured_image_path)
        if not captured_embedding:
            return {"status": "error", "message": "No face detected in captured image. Please ensure good lighting and face camera directly."}

        # 2. Get stored embedding for user
        # If user has no embedding yet, we might need to generate it from their profile image (enrollment)
        # For now, let's assume user.face_encoding stores the embedding list/json
        import json
        
        print(f"DEBUG: Checking enrollment for user {user.id}. Encoding length: {len(user.face_encoding) if user.face_encoding else 'None'}")

        if not user.face_encoding:
             # Fallback: if we have a profile image path but no embedding, generate it now (Lazy Enrollment)
             # This is a temporary fix for migration. Ideally, enrollment happens at registration.
             # For the 'seed' users, we might need to handle this.
             return {"status": "error", "message": "User face not enrolled."}

        stored_embedding = json.loads(user.face_encoding)

        # 3. Calculate Cosine Similarity
        # DeepFace.verify uses distance, where lower is better for Cosine.
        # Cosine Distance = 1 - Cosine Similarity. 
        # DeepFace 'cosine' metric is actually Cosine Distance.
        # Threshold 0.45 for ArcFace is standard for strict matching.
        
        dist = cosine(captured_embedding, stored_embedding)
        
        print(f"Distance: {dist} (Threshold: 0.45)")

        if dist < 0.45:
            return {"status": "success", "message": "Face Verified", "confidence": (1 - dist) * 100}
        else:
            return {"status": "error", "message": "Face not matched. Please try again."}

    except Exception as e:
        print(f"Verification error: {e}")
        return {"status": "error", "message": f"System error: {str(e)}"}
