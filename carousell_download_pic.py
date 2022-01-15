import json
import requests
import shutil

with open('data.json', 'r') as f:
    data = json.load(f)
for i, v in data.items():
    r = requests.get(v['img'], stream=True)
    r.raw.decode_content = True
    with open(f'imgs/{i}.jpg','wb') as f:
        shutil.copyfileobj(r.raw, f)