import os
import time
import json
import pickle
import requests


def get_token(region='ap-3'):
    if not (os.path.isfile(f'../token-{region}.pickle') and time.time() - os.path.getmtime(f'../token-{region}.pickle') < 86000):  # a day - 400 seconds buffer
        print('Requesting token...')
        token_url = 'https://iam.myhuaweicloud.com/v3/auth/tokens'
        headers = {'Content-Type': 'application/json'}
        with open(f'../creds-{region}.json', 'r') as f:
            payload = json.load(f)
        response = requests.post(token_url, headers=headers, json=payload, verify=False)
        if response.status_code == 201:
            print('Token request successful!')
            print(response.text)
            token = response.headers['X-Subject-Token']
            with open(f'../token-{region}.pickle', 'wb') as f:
                pickle.dump(token, f)
        else:
            print(response.text)
            raise Exception('Token request failed!')
    else:
        with open(f'../token-{region}.pickle', 'rb') as f:
            token = pickle.load(f)
    return token
