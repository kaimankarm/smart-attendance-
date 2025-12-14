from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
import math
import base64
import os

import numpy as np
import cv2
from deepface import DeepFace

app = Flask(__name__)
CORS(app)

# -------------------------
# USERS
# -------------------------

USERS = {
    "teacher": {"id": "T01", "name": "Professor Smith", "role": "teacher", "password": "admin"},
    "student": {"id": "S01", "name": "John Doe", "role": "student", "password": "123"},
    "student2": {"id": "S02", "name": "Jane Wilson", "role": "student", "password": "123"},
}

USER_BY_ID = {u["id"]: u for u in USERS.values()}

GLOBAL_STATE = {
    "lecture_active": False,
    "announcements": [{"message": "Welcome to the new semester! Enable camera."}],
    "attendance": [],
    "campus_location": {"latitude": 34.0522, "longitude": -118.2437, "radius_km": 0.5}
}

# -------------------------
# Helper
# -------------------------

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

# -------------------------
# Face DB Loading
# -------------------------

FACES_BASE_DIR = None
for cand in ["faces", "student_face", "student_faces"]:
    if os.path.isdir(os.path.join(os.getcwd(), cand)):
        FACES_BASE_DIR = cand
        break

REFERENCE_FACES = {}

def load_reference_faces():
    global REFERENCE_FACES
    REFERENCE_FACES = {}

    if not FACES_BASE_DIR:
        print("[FACE] No face folder found.")
        return

    base = os.path.join(os.getcwd(), FACES_BASE_DIR)
    print(f"[FACE] Using faces directory: {base}")

    for sid in os.listdir(base):
        folder = os.path.join(base, sid)
        if not os.path.isdir(folder):
            continue

        files = [
            os.path.join(folder, f)
            for f in os.listdir(folder)
            if f.lower().endswith((".jpg", ".jpeg", ".png"))
        ]

        if files:
            REFERENCE_FACES[sid] = files
            print(f"[FACE] Loaded {len(files)} images for {sid}")

load_reference_faces()

# -------------------------
# base64 → OpenCV
# -------------------------

def decode_base64_to_cv2_image(data_url):
    try:
        header, encoded = data_url.split(",", 1)
    except ValueError:
        encoded = data_url

    try:
        img_bytes = base64.b64decode(encoded)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        return frame
    except Exception as e:
        print("[FACE] Decode error:", e)
        return None

# -------------------------
# FACE VERIFY (REAL FIX)
# -------------------------

def verify_face(student_id: str, image_data_url: str):
    """Ensures: real face exists + correct student + no spoof."""

    if student_id not in REFERENCE_FACES:
        return False, None, f"No stored images for {student_id}"

    live_img = decode_base64_to_cv2_image(image_data_url)

    print("[DEBUG] live_img:", type(live_img),
          "shape:", None if live_img is None else live_img.shape)

    if live_img is None:
        return False, None, "Camera image decode failed"

    # Convert BGR → RGB
    live_rgb = cv2.cvtColor(live_img, cv2.COLOR_BGR2RGB)

    # -------- 1. FACE DETECTION (mandatory) --------
    try:
        # Extract faces with confidence
        detected_faces = DeepFace.extract_faces(
            img_path=live_rgb,
            detector_backend="retinaface",
            enforce_detection=True
        )

        if len(detected_faces) == 0:
            return False, None, "No face detected"
        
        # Check confidence of the first detected face
        # detected_faces is a list of dicts, each has 'face', 'facial_area', 'confidence'
        confidence = detected_faces[0].get("confidence", 0)
        print(f"[FACE] Detection confidence: {confidence}")
        
        if confidence < 0.90:
            return False, None, "No face detected (low confidence)"

    except Exception as e:
        print("[FACE] No face detected:", e)
        return False, None, "No face detected"

    # -------- 2. VERIFY AGAINST STORED IMAGES --------
    potential_spoof = False
    
    for ref in REFERENCE_FACES[student_id]:
        try:
            result = DeepFace.verify(
                live_rgb,
                ref,
                model_name="ArcFace",
                detector_backend="retinaface",
                anti_spoofing=True,
                enforce_detection=False
            )

            verified = result.get("verified", False)
            is_real = result.get("is_real", True)  # anti-spoofing
            dist = result.get("distance")

            print(f"[FACE] Compare {student_id} with {ref}: verified={verified}, real={is_real}, dist={dist}")

            if verified:
                if is_real:
                    return True, result, None
                else:
                    potential_spoof = True

        except Exception as e:
            print("[FACE] DeepFace error:", e)

    if potential_spoof:
        return False, None, "Spoofing detected"
        
    return False, None, "Face not matched"

# -------------------------
# AUTH
# -------------------------

@app.route('/login', methods=['POST'])
def login():
    d = request.json or {}
    u = USERS.get(d.get("username"))
    if u and u["password"] == d.get("password"):
        return jsonify({k: v for k, v in u.items() if k != "password"})
    return jsonify({"error": "Invalid credentials"}), 401

# -------------------------
# TEACHER
# -------------------------

@app.route('/toggle_lecture', methods=['POST'])
def toggle_lecture():
    GLOBAL_STATE["lecture_active"] = not GLOBAL_STATE["lecture_active"]
    return jsonify({"active": GLOBAL_STATE["lecture_active"]})

@app.route('/post_announcement', methods=['POST'])
def post_announcement():
    msg = (request.json or {}).get("message")
    if not msg:
        return jsonify({"error": "Message required"}), 400
    GLOBAL_STATE["announcements"].insert(0, {"message": msg})
    return jsonify({"success": True})

@app.route('/export_excel', methods=['GET'])
def export_excel():
    return jsonify(GLOBAL_STATE["attendance"])

# -------------------------
# STUDENT
# -------------------------

@app.route('/get_dashboard', methods=['GET'])
def get_dashboard():
    return jsonify(GLOBAL_STATE)

@app.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    if not GLOBAL_STATE["lecture_active"]:
        return jsonify({"error": "Lecture is not active"}), 400

    d = request.json or {}
    sid = d.get("student_id")
    img = d.get("image")
    lat = d.get("latitude")
    lon = d.get("longitude")

    if not sid or not img:
        return jsonify({"error": "Missing student_id or image"}), 400

    # Geofence logging (optional)
    try:
        dist = calculate_distance(
            GLOBAL_STATE["campus_location"]["latitude"],
            GLOBAL_STATE["campus_location"]["longitude"],
            float(lat), float(lon)
        )
        print(f"[GEOFENCE] {sid} distance: {dist:.2f} km")
    except:
        pass

    ok, info, err = verify_face(sid, img)
    if not ok:
        return jsonify({"error": err}), 400

    if any(x["student_id"] == sid for x in GLOBAL_STATE["attendance"]):
        return jsonify({"message": "Attendance already marked"})

    rec = {
        "student_id": sid,
        "student_name": USER_BY_ID.get(sid, {}).get("name", "Unknown"),
        "timestamp": datetime.datetime.now().isoformat(),
        "latitude": lat,
        "longitude": lon,
        "distance": info.get("distance", None),
        "model": info.get("model_name", "ArcFace"),
    }

    GLOBAL_STATE["attendance"].append(rec)
    return jsonify({"message": "Attendance Marked!"})

@app.route('/apply_leave', methods=['POST'])
def apply_leave():
    return jsonify({"message": "Leave submitted"})

# -------------------------
# MAIN
# -------------------------

if __name__ == "__main__":
    print("--- Flask Server Running ---")
    print("Faces directory:", FACES_BASE_DIR)
    print("Loaded IDs:", list(REFERENCE_FACES.keys()))
    app.run(host='0.0.0.0', debug=True, port=5000)
