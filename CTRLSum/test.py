import requests

url = "https://c6c8ba950ff3402a80eceae054f54dcc.apig.ap-southeast-1.huaweicloudapis.com/v1/infers/20fa221b-0179-4056-b2eb-9114a51f37dd"
headers = {'Content-Type': 'application/json', 'X-Apig-Appcode': '3618f13971c84fe7b5c745b1b0d8a88879d54091bca5406a99508f251596cc71'}

source = 'Delivery within 3-days  Cash on delivery or Transfer Office Chair 04 Material: Mesh Colour: Black，Red，Grey Size:See the image Free Delivery Free Installation Fast respond to your inquiry Registered business For Your Information Dimension may be approximately 2-3cm different.  Free delivery to lift level If lift not available Extra Charges for Labour charges will apply. → 2nd level (no lift) $20 → 3rd level (no lift) $30 → 4th level (no lift) $40 → Delivery to Jurong Island, Sentosa, and Changi Airport $30  Appointment Based, Please indicate delivery date and the timing is according to the seller schedule only. Condo and office no weekend delivery. Strictly no exchange,return or refund. Blk2 Toa Payoh Industrial Park. S(319054)'
prompt = 'The delivery time is:'
query = 'How long is delivery?'

payload = {'source': source, 'prompt': prompt, 'query': query}

r = requests.post(f'{url}/qna', headers=headers, json=payload)
# r = requests.get('http://192.168.1.9:8080/health')
# r = requests.post(f'{url}/qna', json=payload)
print(r.text)
