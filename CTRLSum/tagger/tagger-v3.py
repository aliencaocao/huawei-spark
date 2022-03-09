import os
import sys
import json
import logging
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

logger = logging.getLogger(__name__)
logging.basicConfig(stream=sys.stdout,
                    format="%(asctime)s - %(levelname)s - %(name)s -   %(message)s",
                    datefmt="%m/%d/%Y %H:%M:%S",
                    level=logging.DEBUG)

session = InferenceSession("onnx_model/model.onnx", providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])  # ranked in priority, 'TensorrtExecutionProvider',
model = onnx.load("onnx_model/model.onnx")
tokenizer = AutoTokenizer.from_pretrained('bert-large-cased', cache_dir=cache_dir, use_fast=True, local_files_only=offline_mode)

source_text = "Earlier, the International Committee of the Red Cross had said planned civilian evacuations from Mariupol and Volnovakha were unlikely to start on Saturday. The city council in Mariupol had accused Russia of not observing a ceasefire, while Moscow said Ukrainian “nationalists” were preventing civilians from leaving."

inputs = tokenizer(source_text, return_tensors="np")
inputs = {k: v.astype(np.int64) for k, v in inputs.items()}
print(len(inputs['input_ids'][0]))
print(len(source_text.split()))
outputs = session.run(output_names=["logits"], input_feed={'input_ids': inputs['input_ids'], 'attention_mask': inputs['attention_mask'], 'token_type_ids': inputs['token_type_ids']})


def post_process(predictions):
    # label2id = {label: i for i, label in enumerate(labels)}
    preds = np.argmax(predictions, axis=2)
    predictions = scipy.special.softmax(predictions, axis=2)
    batch_size, seq_len = preds.shape
    preds_prob_list = [predictions[0][j][1] for j in range(seq_len)][1:-1]  # remove start and end token
    keywords = [inputs['input_ids'][0][i] for i in range(len(preds_prob_list)) if preds_prob_list[i] > 0.1]
    return keywords


keywords = post_process(outputs[0])
keywords = [tokenizer.decode(keyword) for keyword in keywords]
print(keywords)
