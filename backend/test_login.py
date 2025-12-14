import requests
import json

BASE_URL = "http://localhost:5000"

def test_login(username, password):
    url = f"{BASE_URL}/api/auth/login"
    payload = {"username": username, "password": password}
    try:
        response = requests.post(url, json=payload)
        print(f"Login attempt for {username}: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error connecting to {url}: {e}")

if __name__ == "__main__":
    print("Testing Student Login (S01 / 123)...")
    test_login("S01", "123")
    
    print("\nTesting Teacher Login (T01 / admin)...")
    test_login("T01", "admin")
