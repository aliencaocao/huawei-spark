import os
import sys
import json
import logging
import time
import scipy.special
import numpy as np
from transformers import AutoTokenizer
from flask import Flask, request, jsonify
import onnx
from onnxruntime import InferenceSession

os.environ['HF_DATASETS_OFFLINE'] = 'TRUE'
os.environ['HF_UPDATE_DOWNLOAD_COUNTS'] = 'FALSE'
os.chdir(os.path.abspath('ctrl-sum'))

cache_dir = 'cache/'
offline_mode = True  # set to True for ModelArts deployment
threshold = 0.3  # default for CNNDM is 0.25

logger = logging.getLogger(__name__)
logging.basicConfig(stream=sys.stdout, format="%(asctime)s - %(levelname)s - %(name)s - %(message)s", datefmt="%m/%d/%Y %H:%M:%S", level=logging.DEBUG)

start = time.time()
logger.info('Loading model...')
session = InferenceSession("onnx_model/model.onnx", providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])  # ranked in priority, 'TensorrtExecutionProvider',
logger.info('Loading tokenizer...')
tokenizer = AutoTokenizer.from_pretrained('bert-large-cased', cache_dir=cache_dir, use_fast=True, local_files_only=offline_mode)
logger.info(f'Model and tokenizer loaded in {time.time() - start} sec')

app = Flask(__name__)


def preprocess(source):
    inputs = tokenizer(source, return_tensors="np")
    inputs = {k: v.astype(np.int64) for k, v in inputs.items()}
    return inputs


def gen_tags(inputs):
    logits = session.run(output_names=["logits"], input_feed={'input_ids': inputs['input_ids'], 'attention_mask': inputs['attention_mask'], 'token_type_ids': inputs['token_type_ids']})
    logits = np.squeeze(logits, axis=0)  # remove batch dimension which is 1 in this case
    preds = np.argmax(logits, axis=2)
    logits = scipy.special.softmax(logits, axis=2)
    batch_size, seq_len = preds.shape
    preds_prob_list = [logits[0][j][1] for j in range(seq_len)]
    tags = [inputs['input_ids'][0][i] for i in range(len(preds_prob_list)) if preds_prob_list[i] > threshold]
    tags = [tokenizer.decode(tag, skip_special_tokens=True) for tag in tags]
    return tags


tags = gen_tags(inputs)
tags = ';'.join(tags)
shutil.rmtree('hf_cache', ignore_errors=True)


@app.route('/tagger', methods=['POST'])
def tagger():  # TODO: for longer than 512, enable batching, change gen tags accordingly
    source = request.json
    source = source['source'].replace('\n', ' ').strip()
    inputs = preprocess(source)
    tags = gen_tags(inputs)
    return jsonify({'tags': tags})


@app.route('/health', methods=['GET'])
def health():
    """
    Official API endpoint exposed to ModelArts
    This is a dummy one because ModelArts seem to use real-time monitoring and thus calls this endpoint hundreds of times in a minute, The server will be overloaded by this health check. Another custom endpoint is used for health check instead.
    """
    return jsonify({'health': 'true'})


@app.route('/status', methods=['GET'])
def status():  # TODO
    """ Custom endpoint for health check (not exposed to ModelArts) """
    try:
        if preprocess('the sky is blue') == 'sky':
            return jsonify({'health': 'true'})
    except:
        pass
    # another try except for actual pred
    return jsonify({'health': 'false'})


if __name__ == '__main__':
    from waitress import serve
    import logging
    server_logger = logging.getLogger('waitress')
    server_logger.setLevel(logging.DEBUG)
    serve(app, host='0.0.0.0', port=8080, expose_tracebacks=True, threads=8)
