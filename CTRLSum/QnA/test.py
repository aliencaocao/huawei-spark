import time
import requests

url = "https://01516f373f434921a874bf502a986a58.apig.ap-southeast-3.huaweicloudapis.com/v1/infers/2f77d2c9-7332-4cfd-a64a-1158631126a0"
headers = {'Content-Type': 'application/json', 'X-Apig-Appcode': 'b50c2b3280ce4962a72610a4a4e0fc14f3b6b05932de4346b21e41ec5c32c4ac'}

source = 'Delivery within 3-days  Cash on delivery or Transfer Office Chair 04 Material: Mesh Colour: Black，Red，Grey Size:See the image Free Delivery Free Installation Fast respond to your inquiry Registered business For Your Information Dimension may be approximately 2-3cm different.  Free delivery to lift level If lift not available Extra Charges for Labour charges will apply. → 2nd level (no lift) $20 → 3rd level (no lift) $30 → 4th level (no lift) $40 → Delivery to Jurong Island, Sentosa, and Changi Airport $30  Appointment Based, Please indicate delivery date and the timing is according to the seller schedule only. Condo and office no weekend delivery. Strictly no exchange,return or refund. Blk2 Toa Payoh Industrial Park. S(319054)'
prompt = 'The delivery time is:'
query = 'How long is delivery?'

payload = {'source': source, 'prompt': prompt, 'query': query}

start = time.time()
r = requests.post(f'{url}/qna', headers=headers, json=payload)
# r = requests.get('http://192.168.1.9:8080/health')
# r = requests.post(f'http://192.168.1.9:8080/qna', json=payload)
print(r.text)
print(f'Time taken: {time.time() - start}')
