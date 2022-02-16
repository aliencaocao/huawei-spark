import os
import requests
import base64
import json
import pickle
import time

if not (os.path.isfile('token.pickle') and time.time() - os.path.getmtime('token.pickle') < 86000):  # a day - 400 seconds buffer
    print('Requesting token...')
    token_url = 'https://iam.myhuaweicloud.com/v3/auth/tokens'
    headers = {'Content-Type': 'application/json'}
    with open('creds.json', 'r') as f:
        payload = json.load(f)
    response = requests.post(token_url, headers=headers, json=payload, verify=False)
    if response.status_code == 201:
        print('Token request successful!')
        token = response.headers['X-Subject-Token']
        with open('token.pickle', 'wb') as f:
            pickle.dump(token, f)
    else:
        print(response.text)
        raise Exception('Token request failed!')
else:
    with open('token.pickle', 'rb') as f:
        token = pickle.load(f)


url = "https://image.ap-southeast-1.myhuaweicloud.com/v2.0/image/tagging"
token = "Actual token value obtained by the user"
headers = {'Content-Type': 'application/json', 'X-Auth-Token': token}

image_path = r'office.jpg'
with open(image_path, "rb") as f:
    image_base64 = base64.b64encode(f.read()).decode("utf-8")
payload = {"image": image_base64}  # Set either the URL or the image.

print('POSTing request to the server')
response = requests.post(url, headers=headers, json=payload, verify=False)
print(response.text)

# Parsing
if response.status_code == 200:
    print('Parsing response')
    data = json.loads(response.text)
    data = data['result']['tags']
    for i in data:
        print(f'tag: {i["tag"]}')
        print(f'type: {i["type"]}')
        instances = i['instances']
        print(f'Detected {len(instances)} of this tag')
        for j in instances:
            print(f'Confidence: {j["confidence"]}')
            bounding_box = j['bounding_box']
            h = bounding_box["height"]
            w = bounding_box["width"]
            top_left_x = bounding_box["top_left_x"]
            top_left_y = bounding_box["top_left_y"]
            print(f'Bounding box: height:{h}, width:{w}, x:{top_left_x}, y:{top_left_y}')
            x1, y1 = top_left_x, top_left_y
            x2, y2 = top_left_x+w, top_left_y
            x3, y3 = top_left_x, top_left_y+h
            x4, y4 = top_left_x+w, top_left_y+h
            print(f'Bounding box coordinates: x1y1:{x1, y1}, x2y2:{x2, y2}, x3y3:{x3, y3}, x4y4:{x4, y4}')
else:
    print(f'Error: {response.status_code}')
    print(response.text)
