import sys
sys.path.append('..')
import json
import urllib3
import requests
import obtain_token
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

token = obtain_token.get_token(region='ap-3')

url = 'https://moderation.ap-southeast-3.myhuaweicloud.com/v2/017ae3a1064e417fb0c520416f56fb26/moderation/image'
headers = {'Content-Type': 'application/json', 'X-Auth-Token': token}

image_url = 'https://images.unsplash.com/photo-1626218174358-7769486c4b79?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8cGMlMjBnYW1pbmd8ZW58MHx8MHx8&w=1000&q=80'  # can be Huawei OBS URL or any other
# image = ''  # base64 encoded image, set to 'image' attribute of payload instead of 'url'
payload = {"url": image_url, 'categories': ['porn']}  # 'terrorism' for unknown reason says IAM user not authorized but porn works

print('POSTing request to the server')
response = requests.post(url, headers=headers, json=payload, verify=False)

if response.status_code == 200:
    data = json.loads(response.text)['result']
    category_results = data['category_suggestions']  # results by each category, e.g. {'porn': 'pass'}
    result = data['suggestion']  # 'pass', 'review', 'block'
    print(f'Result: {result}\nCategory results: {category_results}')
else:
    print(f'Error: {response.status_code}')
    print(response.text)
