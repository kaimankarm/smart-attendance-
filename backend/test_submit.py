import requests
import json

url = "http://localhost:5000/api/quiz/submit"
payload = {
    "quiz_id": 1,
    "student_id": "S01",
    "answers": { "0": 1 }
}
headers = {'Content-Type': 'application/json'}

try:
    print(f"Sending POST to {url}...")
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
