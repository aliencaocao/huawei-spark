# Copyright (c) 2022, Billy Cao.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
import os
import logging
import shutil
import subprocess
from flask import Flask, request, jsonify

app = Flask(__name__)


def gen_tags(source):  # TODO: avoid reloading model every time else will time out
    try:
        tagger_model_dir = 'cnn_bert_tagger'
        max_keywords = '5'  # default for CNNDM is 30
        conf_threshold = '0.3'  # default for CNNDM is 0.25
        summary_size = '10'  # default for CNNDM is 10
        dataset_name = 'temp'

        if not os.path.isdir(os.path.join('datasets', dataset_name)):
            os.makedirs(os.path.join('datasets', dataset_name))

        with open(os.path.join('datasets', dataset_name, 'test.source'), 'w+') as s, open(os.path.join('datasets', dataset_name, 'test.target'), 'w+') as t:
            s.write(source)
            t.write(source[0])  # target won't be used so just use first word as placeholder

        subprocess.run(['python3.8', 'scripts/preprocess.py', dataset_name, '--mode', 'pipeline', '--split', 'test', '--num-workers', '1'])
        subprocess.run(['bash', 'scripts/train_seqlabel.sh', '-g', '0', '-p', tagger_model_dir, '-d', dataset_name])
        subprocess.run(['python3.8', 'scripts/preprocess.py', dataset_name, '--split', 'test', '--mode', 'process_tagger_prediction', '--tag-pred', f'{tagger_model_dir}/test_predictions.txt', '--threshold', conf_threshold, '--maximum-word', max_keywords, '--summary-size', summary_size])

        with open(os.path.join('datasets', dataset_name, f'test.ts{conf_threshold}.mw{max_keywords},sumlen{summary_size}.default.predword'), 'r') as f:
            tags = ';'.join(str(f.read()).split())

        # clean up temp files
        shutil.rmtree(os.path.join('datasets', dataset_name), ignore_errors=True)
        shutil.rmtree('data-bin', ignore_errors=True)
        shutil.rmtree(os.path.join(tagger_model_dir, 'wandb'), ignore_errors=True)
        os.remove(os.path.join(tagger_model_dir, 'test_predictions.txt'))
        os.remove(os.path.join(tagger_model_dir, 'test_results.txt'))
    except Exception as e:
        tags = f'ERROR {e}'
    return tags


@app.route('/tagger', methods=['POST'])
def tagger():
    source = request.json
    source = source['source'].replace('\n', ' ').strip()
    tags = gen_tags(source)
    return jsonify({'tags': tags})


@app.route('/health', methods=['GET'])
def health():  # TODO: unique dataset name to avoid conflicts, health check disabled for now
    """Sanity check"""
    # try:
    #     if gen_tags('the sky is blue') == 'sky':
    #         return jsonify({'health': 'true'})
    # except:
    #     pass
    # return jsonify({'health': 'false'})
    return jsonify({'health': 'true'})


if __name__ == '__main__':
    from waitress import serve
    import logging
    logger = logging.getLogger('waitress')
    logger.setLevel(logging.DEBUG)
    os.chdir(os.path.abspath('ctrl-sum'))
    serve(app, host='0.0.0.0', port=8080, expose_tracebacks=True, threads=8)
