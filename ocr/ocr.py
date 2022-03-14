import sys
sys.path.append('..')
import base64
import json
import urllib3
import requests
import obtain_token
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

token = obtain_token.get_token(region='ap-2')

url = 'https://ocr.ap-southeast-2.myhuaweicloud.com/v2/0ebb608a1580900e2faac00bec01abbd/ocr/web-image'
headers = {'Content-Type': 'application/json', 'X-Auth-Token': token}

image_url = 'https://www.minitool.com/images/uploads/news/2019/07/how-to-check-pc-specs-windows-10/how-to-check-pc-specs-windows-10-2.png'  # can be Huawei OBS URL or any other
image_path = 'computer.jpeg'
with open(image_path, "rb") as f:
    image = base64.b64encode(f.read()).decode("utf-8")  # base64 encoded image, set to 'image' attribute of payload instead of 'url'
payload = {'image': image, 'detect_direction': True}

print('POSTing request to the server')
response = requests.post(url, headers=headers, json=payload, verify=False)

if response.status_code == 200:
    word_list = []
    data = json.loads(response.text)['result']
    words_block_list = data['words_block_list']
    for block in words_block_list:
        words = block['words']
        words.encode("utf-8").decode('utf-8', 'ignore')  # filer out non-utf-8 characters
        word_list.append(words)
        print(words)
    print(word_list)
else:
    print(f'Error: {response.status_code}')
    print(response.text)
