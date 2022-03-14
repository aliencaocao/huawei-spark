import time
import requests

url = "https://01516f373f434921a874bf502a986a58.apig.ap-southeast-3.huaweicloudapis.com/v1/infers/4bee9f8d-7d7d-4ccc-a4a9-e0be7a3b49e7"
# url = "http://192.168.1.9:8080"
headers = {'Content-Type': 'application/json', 'X-Apig-Appcode': 'b50c2b3280ce4962a72610a4a4e0fc14f3b6b05932de4346b21e41ec5c32c4ac'}

source = 'Red office chairs for sale, in mint conditions, buy more for cheaper! Dimensions: height: 70cm, width: 40cm. Delivery is appointment Based, Please indicate delivery date and the timing is according to the seller schedule only. Condo and office no weekend delivery. Strictly no exchange,return or refund. You can also pick up at Blk2 Toa Payoh Industrial Park S(319054)'
prompt = 'The colour is:'
query = 'What is the colour?'


# source = 'Red office chairs for sale, in mint conditions, buy more for cheaper! Dimensions: height: 70cm, width: 40cm. Delivery is appointment Based, Please indicate delivery date and the timing is according to the seller schedule only. Condo and office no weekend delivery. Strictly no exchange,return or refund. You can also pick up at Blk2 Toa Payoh Industrial Park S(319054)'
'''For attribute filling'''
# prompt = 'The colour is:'  # works: red
# query = 'What is the colour?'  # works: red
# prompt = 'The height is:'  # works: 70cm
# query = 'What is the height?'  # works: 70cm
# prompt = 'The width is:'  # works: 40cm
# query = 'What is the width?'  # works: 40cm

'''For chat bot'''
# prompt = ''  # works when prompt is empty
# query = 'What is the address for self collection?'  # works: Blk2 Toa Payoh Industrial Park S(319054)

payload = {'source': source, 'prompt': prompt, 'query': query}

start = time.time()
# r = requests.get(f'{url}/health', headers=headers)
r = requests.post(f'{url}/qna', headers=headers, json=payload)
print(r.text)
print(f'Time taken: {time.time() - start}')
