"""Auth Flow Test Script"""
import requests
import json

BASE = 'http://localhost:8000'

print('=== REGISTER ===')
r = requests.post(f'{BASE}/auth/register', json={'email':'testuser2@example.com', 'password':'SecurePass123'})
print(f'Status: {r.status_code}')
try:
    data = r.json()
    print(f'Response: {json.dumps(data, indent=2)}')
except:
    print(f'Raw: {r.text[:300]}')

if r.status_code in [201, 409]:  # 409 = already exists, still try login
    print('\n=== LOGIN ===')
    r = requests.post(f'{BASE}/auth/login', json={'email':'testuser2@example.com', 'password':'SecurePass123'})
    print(f'Status: {r.status_code}')
    
    if r.status_code == 200:
        data = r.json()
        access_token = data['access_token']
        refresh_token = data['refresh_token']
        print(f'Access Token: {access_token[:50]}...')
        print(f'Refresh Token: {refresh_token[:30]}...')
        
        print('\n=== GET PROFILE ===')
        r = requests.get(f'{BASE}/auth/me', headers={'Authorization': f'Bearer {access_token}'})
        print(f'Status: {r.status_code}')
        print(f'Response: {r.json()}')
        
        print('\n=== REFRESH TOKEN ===')
        r = requests.post(f'{BASE}/auth/refresh', json={'refresh_token': refresh_token})
        print(f'Status: {r.status_code}')
        new_data = r.json()
        print(f'New Access Token: {new_data.get("access_token", "NONE")[:30]}...')
        
        print('\n=== LOGOUT ===')
        new_refresh = new_data.get('refresh_token', refresh_token)
        r = requests.post(f'{BASE}/auth/logout', json={'refresh_token': new_refresh})
        print(f'Status: {r.status_code}')
        print(f'Response: {r.json()}')
    else:
        print(f'Login failed: {r.json()}')
