import requests

url = "https://01516f373f434921a874bf502a986a58.apig.ap-southeast-3.huaweicloudapis.com/v1/infers/16a630d6-a82c-4bec-879f-ef107cbd2fc4"
# url = "http://de.irscybersec.ml:8080"
headers = {'Content-Type': 'application/json', 'X-Apig-Appcode': 'b50c2b3280ce4962a72610a4a4e0fc14f3b6b05932de4346b21e41ec5c32c4ac'}

source = 'Delivery within 3-days  Cash on delivery or Transfer Office Chair 04 Material: Mesh Colour: Black，Red，Grey Size:See the image Free Delivery Free Installation Fast respond to your inquiry Registered business For Your Information Dimension may be approximately 2-3cm different.  Free delivery to lift level If lift not available Extra Charges for Labour charges will apply. → 2nd level (no lift) $20 → 3rd level (no lift) $30 → 4th level (no lift) $40 → Delivery to Jurong Island, Sentosa, and Changi Airport $30  Appointment Based, Please indicate delivery date and the timing is according to the seller schedule only. Condo and office no weekend delivery. Strictly no exchange,return or refund. Blk2 Toa Payoh Industrial Park. S(319054)'

payload = {'source': source}

# r = requests.get(f'{url}/health', headers=headers)
r = requests.post(f'{url}/tagger', headers=headers, json=payload)

print(r.text)
