# coding=utf-8
import sys
sys.path.append('..')
import logging
import re
import base64
import json
import urllib3
import requests
import obtain_token
from flask import Flask, request, jsonify
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__)
token = obtain_token.get_token(region='ap-2')  # only AP-2 Bangkok supports web image OCR

# Attribute tree dictionary below specify the alternate names or words to capture for each attribute under each category. Some are in Chinese for the sake of technical demonstration using Chinese pictures.
attribute_tree = {'Computer': {'Brand': [], 'Model': [], 'Processor': ['processor', 'cpu'],
                               'RAM': ['random access memory', 'memory', 'ram', 'memory capacity', 'installed ram'],
                               'Storage': ['storage capacity', 'storage', 'disk size', 'disk capacity'],
                               'Graphics': ['GPU', 'graphics card', 'graphics']},
                  'Mobile Gadgets': {'Brand': ['品牌'], 'Model': ['型号', '认证型号'], 'Screen Size': [],
                                     'RAM': ['<INFO>', 'RAM', '</INFO>', '+', '<INFO>', 'ROM', '</INFO>'],
                                     'ROM': ['<INFO>', 'RAM', '</INFO>', '+', '<INFO>', 'ROM', '</INFO>'],
                                     'Battery': ['battery capacity', 'battery']},
                  }

logger = logging.getLogger(__name__)
logging.basicConfig(stream=sys.stdout, format="%(asctime)s - %(levelname)s - %(name)s - %(message)s", datefmt="%m/%d/%Y %H:%M:%S", level=logging.DEBUG)


# Define all the category-specific extractors here
def mobile_gadgets_extractor(word_list, word_list_lowered, category_attributes):
    filled_attributes = {}
    # First try the naive approach to fill RAM and ROM before going into expensive loops below
    possible_fields = ['RAM', 'ROM']
    possible_values = [word for word in word_list if 'gb' in word.lower()]
    possible_values = [int(re.sub(r"\D+", "", value)) for value in possible_values]  # keep only digits to compare
    if len(possible_values) == len(possible_fields):
        filled_attributes['RAM'] = f'{min(possible_values)}GB'  # RAM on most phones should always be smaller than ROM, can safely assume unit is GB because previous we checked for 'gb' in word.lower()
        filled_attributes['ROM'] = f'{max(possible_values)}GB'
    for k, v in category_attributes.items():
        for i in range(len(word_list) - 1):  # stop finding at 2nd last word
            if '<INFO>' in v and k not in filled_attributes:
                fields = []
                for j in range(len(v)):
                    if v[j] == '<INFO>':
                        if 'delimiter_start' in locals():
                            delimiter = ' '.join(v[delimiter_start:j])
                        j += 1  # can skip to at least the next item because attribute name must occupy 1 or more list items so no need check the immediate next item
                        start = j
                    elif v[j] == '</INFO>':
                        try:
                            fields.append(' '.join(v[start:j]))
                            j += 1  # can skip to at least the next item because after </INFO> tag it should be at least 1 delimiter so no need check the immediate next item
                            delimiter_start = j
                        except NameError:
                            logger.error('Could not find a opening <INFO> tag before a closing </INFO> tag')
                if delimiter in word_list[i]:
                    try:
                        split_fields = word_list_lowered[i].split(delimiter)
                        assert len(split_fields) == len(fields)
                    except AssertionError:
                        logger.error(f'Information extracted does not match number of fields')
                    else:
                        for k in range(len(fields)):
                            filled_attributes[fields[k]] = split_fields[k].replace(fields[k].lower(), '')
                    break
            elif word_list_lowered[i] in v:  # for phones, this part will ignore RAM and ROM because those 2 are defined in template format
                filled_attributes[k] = word_list[i + 1]
                break
    return filled_attributes


def computer_extractor(word_list, word_list_lowered, category_attributes):
    filled_attributes = {}
    for k, v in category_attributes.items():
        for i in range(len(word_list) - 1):  # stop finding at 2nd last word
            if word_list_lowered[i] in v:
                filled_attributes[k] = word_list[i + 1]
                break
    return filled_attributes


category_to_extractor = {'Computer': computer_extractor, 'Mobile Gadgets': mobile_gadgets_extractor}


def ocr(image_url):
    url = 'https://ocr.ap-southeast-2.myhuaweicloud.com/v2/0ebb608a1580900e2faac00bec01abbd/ocr/web-image'
    headers = {'Content-Type': 'application/json', 'X-Auth-Token': token}
    payload = {'url': image_url, 'detect_direction': True}  # 'detect_direction': 'true' for some reason don't work here although its documented in docs

    logger.debug('POSTing request to the server')
    response = requests.post(url, headers=headers, json=payload, verify=False)

    if response.status_code == 200:
        word_list = []
        data = json.loads(response.text)['result']
        words_block_list = data['words_block_list']
        for block in words_block_list:
            words = block['words']
            words.encode("utf-8").decode('utf-8', 'ignore')  # filer out non-utf-8 characters
            word_list.append(words)
        return word_list
    else:
        logger.error(response.text)
        return None


# Main extract function entry point
@app.route('/extract', methods=['POST'])
def extract():
    data = request.json
    category = data['category']
    image_url = data['image_url']
    word_list = ocr(image_url)
    if word_list is None:
        return jsonify({'success': 'false', 'error': 'Error when running OCR'})
    processed_word_list = []

    if category not in category_to_extractor.keys():
        return jsonify({'success': 'false', 'error': f'Category ({category}) is not supported yet.'})

    for word in word_list:  # break up colons
        if ':' in word:
            word = word.split(':')
            processed_word_list += word
        elif '：' in word:
            word = word.split('：')
            processed_word_list += word
        else:
            processed_word_list.append(word)
    processed_word_list = [x for x in processed_word_list if x not in ['', ' ', '\n', '\t']]
    word_list_lowered = [x.lower() for x in processed_word_list]
    category_attributes = attribute_tree[category]
    extractor = category_to_extractor[category]
    try:
        filled_attributes = extractor(processed_word_list, word_list_lowered, category_attributes)
    except Exception as e:
        return jsonify({'success': 'false', 'error': f'Error during extraction: {e}'})
    else:
        return jsonify({'success': 'true', 'result': filled_attributes})


if __name__ == '__main__':
    from waitress import serve
    server_logger = logging.getLogger('waitress')
    server_logger.setLevel(logging.DEBUG)
    serve(app, host='0.0.0.0', port=8080, expose_tracebacks=False, threads=8)
