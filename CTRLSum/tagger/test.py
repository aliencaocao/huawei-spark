import time
import requests

url = "https://01516f373f434921a874bf502a986a58.apig.ap-southeast-3.huaweicloudapis.com/v1/infers/16a630d6-a82c-4bec-879f-ef107cbd2fc4"
url = "http://de.irscybersec.ml:8080"
headers = {'Content-Type': 'application/json', 'X-Apig-Appcode': 'b50c2b3280ce4962a72610a4a4e0fc14f3b6b05932de4346b21e41ec5c32c4ac'}

source = 'Earlier, the International Committee of the Red Cross had said planned civilian evacuations from Mariupol and Volnovakha were unlikely to start on Saturday. The city council in Mariupol had accused Russia of not observing a ceasefire, while Moscow said Ukrainian “nationalists” were preventing civilians from leaving.'

payload = {'source': source}

start = time.time()
# r = requests.get(f'{url}/health', headers=headers)
r = requests.post(f'{url}/tagger', headers=headers, json=payload)

print(r.text)
print(f'Time taken: {time.time() - start}')
