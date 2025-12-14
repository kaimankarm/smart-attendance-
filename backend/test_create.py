import requests
import json

url = "http://localhost:5000/api/quiz/create"
payload = {
    "teacher_id": "T01",
    "title": "Test Quiz from Script",
    "questions": [
        {
            "text": "What is 2+2?",
            "options": ["3", "4", "5", "6"],
            "correct": 1
        }
    ]
}
headers = {'Content-Type': 'application/json'}

try:
    print(f"Sending POST to {url}...")
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
