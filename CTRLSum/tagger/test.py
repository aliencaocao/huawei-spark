import requests

url = "http://127.0.0.1:8080"
headers = {'Content-Type': 'application/json', 'X-Apig-Appcode': '3618f13971c84fe7b5c745b1b0d8a88879d54091bca5406a99508f251596cc71'}

source = 'Delivery within 3-days  Cash on delivery or Transfer Office Chair 04 Material: Mesh Colour: Black，Red，Grey Size:See the image Free Delivery Free Installation Fast respond to your inquiry Registered business For Your Information Dimension may be approximately 2-3cm different.  Free delivery to lift level If lift not available Extra Charges for Labour charges will apply. → 2nd level (no lift) $20 → 3rd level (no lift) $30 → 4th level (no lift) $40 → Delivery to Jurong Island, Sentosa, and Changi Airport $30  Appointment Based, Please indicate delivery date and the timing is according to the seller schedule only. Condo and office no weekend delivery. Strictly no exchange,return or refund. Blk2 Toa Payoh Industrial Park. S(319054)'

payload = {'source': source}

r = requests.get(f'{url}/health')
# r = requests.post(f'{url}/tagger', headers=headers, json=payload)

print(r.text)
