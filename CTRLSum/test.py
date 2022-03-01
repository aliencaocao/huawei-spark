import os
import json
import requests
import pickle
import time

if not (os.path.isfile('../token.pickle') and time.time() - os.path.getmtime('../token.pickle') < 86000):  # a day - 400 seconds buffer
    print('Requesting token...')
    token_url = 'https://iam.myhuaweicloud.com/v3/auth/tokens'
    headers = {'Content-Type': 'application/json'}
    with open('../creds.json', 'r') as f:
        payload = json.load(f)
    response = requests.post(token_url, headers=headers, json=payload, verify=False)
    if response.status_code == 201:
        print('Token request successful!')
        print(response.text)
        token = response.headers['X-Subject-Token']
        with open('../token.pickle', 'wb') as f:
            pickle.dump(token, f)
    else:
        print(response.text)
        raise Exception('Token request failed!')
else:
    with open('../token.pickle', 'rb') as f:
        token = pickle.load(f)


url = "https://c135ace529d646bf8d9a6c6f7be78989.apig.ap-southeast-1.huaweicloudapis.com/v1/infers/47be164f-4c9f-4e96-8c8c-c8f4b6c7bf76"
headers = {'Content-Type': 'application/json', 'X-Auth-Token': token}

source = 'Delivery within 3-days  Cash on delivery or Transfer Office Chair 04 Material: Mesh Colour: Black，Red，Grey Size:See the image Free Delivery Free Installation Fast respond to your inquiry Registered business For Your Information Dimension may be approximately 2-3cm different.  Free delivery to lift level If lift not available Extra Charges for Labour charges will apply. → 2nd level (no lift) $20 → 3rd level (no lift) $30 → 4th level (no lift) $40 → Delivery to Jurong Island, Sentosa, and Changi Airport $30  Appointment Based, Please indicate delivery date and the timing is according to the seller schedule only. Condo and office no weekend delivery. Strictly no exchange,return or refund. Blk2 Toa Payoh Industrial Park. S(319054)'
prompt = 'How long is delivery?'
query = 'How long is delivery?'

payload = {'source': source, 'prompt': prompt, 'query': query}

r = requests.post(f'{url}/qna', json=payload)
print(r.text)
