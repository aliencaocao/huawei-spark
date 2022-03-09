# coding=utf-8

# Copyright (c) 2020, salesforce.com, inc. Modified 2022, Billy Cao
# All rights reserved.
# SPDX-License-Identifier: BSD-3-Clause
# For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
""" This code is based on
https://github.com/huggingface/transformers/blob/master/examples/token-classification/run_ner.py

For use with ctrl-sum-stripped.zip, NOT the original ctrl-sum!
"""

import os
import sys
import time
import logging
import shutil
import subprocess
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from flask import Flask, request, jsonify

# Disable all internet requests or reduce timeouts to reduce inference latency on ModelArts instance where there is no internet access
import socket
os.environ['HF_DATASETS_OFFLINE'] = 'TRUE'
os.environ['HF_UPDATE_DOWNLOAD_COUNTS'] = 'FALSE'
socket._GLOBAL_DEFAULT_TIMEOUT = 0.01
socket.setdefaulttimeout(0.01)

import numpy as np
import scipy
from torch import nn

from transformers import AutoConfig, AutoModelForTokenClassification, AutoTokenizer, Trainer
from datasets import load_dataset
sys.path.append('ctrl-sum')
from utils_sum_hf import create_hf_dataset
os.chdir(os.path.abspath('ctrl-sum'))

app = Flask(__name__)

tagger_model_dir = 'cnn_bert_tagger'
tokenizer_name = 'bert-large-cased'
ds_id = -1  # incrementing per gen_tags call
cache_dir = 'cache/'
max_seq_length = 128
split = 'test'
offline_mode = True  # set to True for ModelArts deployment

# Setup logging
logger = logging.getLogger(__name__)
logging.basicConfig(stream=sys.stdout,
                    format="%(asctime)s - %(levelname)s - %(name)s -   %(message)s",
                    datefmt="%m/%d/%Y %H:%M:%S",
                    level=logging.DEBUG)

labels = ["0", "1"]
label_map: Dict[int, str] = {i: label for i, label in enumerate(labels)}
num_labels = len(labels)

# Load pretrained model and tokenizer
start = time.time()
print("Loading model")
config = AutoConfig.from_pretrained(
    tagger_model_dir,
    num_labels=num_labels,
    id2label=label_map,
    label2id={label: i for i, label in enumerate(labels)},
    cache_dir=cache_dir,
    local_files_only=offline_mode)
tokenizer = AutoTokenizer.from_pretrained(
    tokenizer_name,
    cache_dir=cache_dir,
    use_fast=True,
    local_files_only=offline_mode)
model = AutoModelForTokenClassification.from_pretrained(
    tagger_model_dir,
    from_tf=False,
    config=config,
    cache_dir=cache_dir,
    local_files_only=offline_mode)
trainer = Trainer(model=model)
print("Model loaded. Time taken:", time.time() - start)


def align_predictions(predictions: np.ndarray, label_ids: np.ndarray) -> Tuple[List[int], List[int]]:
    label2id = {label: i for i, label in enumerate(labels)}
    preds = np.argmax(predictions, axis=2)
    predictions = scipy.special.softmax(predictions, axis=2)
    batch_size, seq_len = preds.shape
    preds_list = [[] for _ in range(batch_size)]
    preds_prob_list = [[] for _ in range(batch_size)]

    for i in range(batch_size):
        for j in range(seq_len):
            if label_ids[i, j] != nn.CrossEntropyLoss().ignore_index:
                preds_list[i].append(label_map[preds[i][j]])
                preds_prob_list[i].append(predictions[i][j][label2id['1']])

    return preds_list, preds_prob_list


def gen_tags(source):
    global ds_id
    ds_id += 1
    dataset_name = f'temp{ds_id}'
    data_dir = os.path.join('datasets', dataset_name)
    max_keywords = '30'  # default for CNNDM is 30
    conf_threshold = '0.25'  # default for CNNDM is 0.25
    summary_size = '10'  # default for CNNDM is 10
    if not os.path.isdir(data_dir):
        os.makedirs(data_dir)

    with open(os.path.join('datasets', dataset_name, 'test.source'), 'w+') as s, open(os.path.join('datasets', dataset_name, 'test.target'), 'w+') as t:
        s.write(source)
        t.write(source[0])  # target won't be used so just use first word as placeholder

    # Preprocess
    subprocess.run(['python3.8', 'preprocess.py', dataset_name, '--mode', 'pipeline', '--split', 'test', '--num-workers', '1'])
    test_dataset = create_hf_dataset(data_dir=data_dir,
                                     local_tokenizer=tokenizer,
                                     labels=labels,
                                     model_type=config.model_type,
                                     local_max_seq_length=max_seq_length,
                                     overwrite_cache=False,
                                     split=split)
    # Predict
    predictions, label_ids, metrics = trainer.predict(test_dataset)
    preds_list, preds_prob_list = align_predictions(predictions, label_ids)
    if trainer.is_world_master():
        test_examples = load_dataset('json', data_files=os.path.join(data_dir, f'{split}.seqlabel.jsonl'), cache_dir=os.path.join(data_dir, 'hf_cache'))
        if 'train' in test_examples:
            test_examples = test_examples['train']
        with open(os.path.join(tagger_model_dir, f"{split}_predictions.txt"), "w") as f:  # tagger_model_dir will act as output dir
            assert len(test_examples) == len(preds_prob_list)
            for line_s, line_t in zip(test_examples, preds_prob_list):
                for tok_s, pred in zip(line_s['tokens'], line_t):
                    f.write('{}:{:.3f} '.format(tok_s, pred))
                f.write('\n')

    # Post process
    subprocess.run(['python3.8', 'preprocess.py', dataset_name, '--split', 'test', '--mode', 'process_tagger_prediction', '--tag-pred', f'{tagger_model_dir}/test_predictions.txt', '--threshold', conf_threshold, '--maximum-word', max_keywords, '--summary-size', summary_size])

    with open(os.path.join('datasets', dataset_name, f'test.ts{conf_threshold}.mw{max_keywords},sumlen{summary_size}.default.predword'), 'r') as f:
        tags = ';'.join(str(f.read()).split())

    # clean up temp files
    shutil.rmtree(data_dir, ignore_errors=True)
    shutil.rmtree('hf_cache', ignore_errors=True)
    os.remove(os.path.join(tagger_model_dir, 'test_predictions.txt'))
    return tags


@app.route('/tagger', methods=['POST'])
def tagger():
    source = request.json
    source = source['source'].replace('\n', ' ').strip()
    tags = gen_tags(source)
    return jsonify({'tags': tags})


@app.route('/health', methods=['GET'])
def health():  # TODO: to test
    """Sanity check"""
    try:
        if gen_tags('the sky is blue') == 'sky':
            return jsonify({'health': 'true'})
    except:
        pass
    return jsonify({'health': 'false'})
    # return jsonify({'health': 'true'})


if __name__ == '__main__':
    from waitress import serve
    import logging
    logger = logging.getLogger('waitress')
    logger.setLevel(logging.DEBUG)
    serve(app, host='0.0.0.0', port=8080, expose_tracebacks=True, threads=8)
