import os
import sys
sys.path.append('..')
import json
import base64
import urllib3
import requests
import obtain_token
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

token = obtain_token.get_token(region='ap-1')  # only avail in AP-1

url = "https://image.ap-southeast-1.myhuaweicloud.com/v2/017ae3a1064e417fb0c520416f56fb26/image/tagging"
headers = {'Content-Type': 'application/json', 'X-Auth-Token': token}

image_path = 'office.jpg'
with open(image_path, "rb") as f:
    image_base64 = base64.b64encode(f.read()).decode("utf-8")
payload = {"image": image_base64, 'language': 'en'}  # Set either the URL or the image.

print('POSTing request to the server')
response = requests.post(url, headers=headers, json=payload, verify=False)

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
