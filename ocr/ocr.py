import sys
sys.path.append('..')
import json
import urllib3
import requests
import obtain_token
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

token = obtain_token.get_token(region='ap-2')

url = 'https://ocr.ap-southeast-2.myhuaweicloud.com/v2/0ebb608a1580900e2faac00bec01abbd/ocr/web-image'
headers = {'Content-Type': 'application/json', 'X-Auth-Token': token}

image_url = 'https://www.minitool.com/images/uploads/news/2019/07/how-to-check-pc-specs-windows-10/how-to-check-pc-specs-windows-10-2.png'  # can be Huawei OBS URL or any other
# image = ''  # base64 encoded image, set to 'image' attribute of payload instead of 'url'
payload = {'url': image_url}  # 'detect_direction': 'true' for some reason don't work here although its documented in docs

print('POSTing request to the server')
response = requests.post(url, headers=headers, json=payload, verify=False)

if response.status_code == 200:
    data = json.loads(response.text)['result']
    words_block_list = data['words_block_list']
    for block in words_block_list:
        print(block['words'])
else:
    print(f'Error: {response.status_code}')
    print(response.text)
