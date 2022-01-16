import json
import requests
import shutil

with open('1137582001-1137583000.json', 'r') as f:
    data = json.load(f)
for i, v in data.items():
    print(f'Downloading image for ID {i}')
    r = requests.get(v['img'][0], stream=True)  # only download cover image
    r.raw.decode_content = True
    with open(f'imgs/{i}.jpg', 'wb') as f:
        shutil.copyfileobj(r.raw, f)
