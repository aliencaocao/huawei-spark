# Copyright (c) 2021, Hyunwoong Ko. Modified 2022 by Billy Cao.
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
import json
import torch
from transformers import AutoModelForSeq2SeqLM, PreTrainedTokenizerFast
from flask import Flask, request, jsonify


class Summarizers:
    def __init__(self, device="cpu"):
        print('Initializing CTRL-Sum...')
        self.device = device
        self.model = AutoModelForSeq2SeqLM.from_pretrained('ctrlsum-cnndm').to(self.device)
        self.tokenizer = PreTrainedTokenizerFast.from_pretrained('ctrlsum-cnndm')
        self._5w1h = ["what ",
                      "what's "
                      "when ",
                      "why ",
                      "who ",
                      "who's ",
                      "where ",
                      "how ",
                      "What ",
                      "What's ",
                      "When ",
                      "Why ",
                      "Who ",
                      "Who's ",
                      "Where ",
                      "How "]
        print('CTRL-Sum initialized.')

    @torch.no_grad()
    def __call__(self,
                 contents: str,
                 query: str = "",
                 prompt: str = "",
                 num_beams: int = 5,
                 top_k: int = None,
                 top_p: float = None,
                 no_repeat_ngram_size: int = 4,
                 length_penalty: float = 1.0,
                 question_detection: bool = True) -> str:
        """
        Conduct summarization by focus query and prompt.

        Args:
            contents (str): input contents for summarization
            query (str): keyword or query to focus on
            prompt (str): input prompt (generates a summary that begins with a prompt)
            num_beams (int): size of beam search
            top_k (int): number of sample for top-k sampling
            top_p (float): probability for nucleus sampling
            no_repeat_ngram_size (int): no repeat n-gram size
            length_penalty (float): penalty value for length control
            question_detection (bool): use question prompt template autonomously

        Returns:
            (str): generated summary by focus query and prompt.
        """

        decoder_input_ids, is_question = None, False

        if len(prompt) == 0 and (question_detection and len(query) > 0):
            # if start of query is one of 5W1H + ' ' (space) or
            # if end of query is '?', we define this query is question.

            is_question = query[-1] == "?"
            for word in self._5w1h:
                if query.startswith(word):
                    is_question = True

            if is_question:
                prompt = f"Q:{query} A:"

        if len(prompt) > 0:
            decoder_input_ids = self.tokenizer(prompt, return_tensors="pt")["input_ids"][:, :-1].to(self.device)  # remove eos token

        if len(query) > 0:
            contents = f"{query} => {contents}"

        tokenized = self.tokenizer(contents, return_tensors="pt")

        if decoder_input_ids is None:
            output_ids = self.model.generate(
                max_length=1024,
                input_ids=tokenized["input_ids"].to(self.device),
                attention_mask=tokenized["attention_mask"].to(self.device),
                num_beams=num_beams,
                top_k=top_k,
                top_p=top_p,
                no_repeat_ngram_size=no_repeat_ngram_size,
                length_penalty=length_penalty,
            )
        else:
            output_ids = self.model.generate(
                max_length=1024,
                input_ids=tokenized["input_ids"].to(self.device),
                attention_mask=tokenized["attention_mask"].to(self.device),
                decoder_input_ids=decoder_input_ids,
                num_beams=num_beams,
                top_k=top_k,
                top_p=top_p,
                no_repeat_ngram_size=no_repeat_ngram_size,
                length_penalty=length_penalty,
            )
        summary = self.tokenizer.decode(output_ids.tolist()[0])

        if is_question:
            summary = summary.replace(prompt, "")

        for token in self.tokenizer.special_tokens_map.values():
            summary = summary.replace(token, "")

        return summary.strip()


app = Flask(__name__)
ctrlsum = Summarizers(device='cuda')


@app.route('/qna', methods=['POST'])
def qna():
    """QnA"""
    print('Running QnA')
    contents = request.json
    source = contents['source']
    query = contents['query']
    prompt = contents['prompt']
    ans = ctrlsum(contents=source, query=query, prompt=prompt, num_beams=5,
                  top_k=None, top_p=None, no_repeat_ngram_size=4,
                  length_penalty=1.0, question_detection=True)
    return jsonify({'answer': ans})


@app.route('/tagger', methods=['POST'])
def tagger():  # TODO
    """Generate tags for source"""
    print('Running Tagger')
    source = request.json
    source = source['source']
    return jsonify({'tags': 'None'})


@app.route('/health', methods=['GET'])
def health():
    """Sanity check"""
    if ctrlsum(contents='hello my name is billy', query='', prompt='My name is:', num_beams=5, top_k=None, top_p=None, no_repeat_ngram_size=4, length_penalty=1.0, question_detection=True) == 'My name is: Billy.':
        return jsonify({'health': 'true'})
    return jsonify({'health': 'false'})


if __name__ == '__main__':
    from waitress import serve
    import logging
    logger = logging.getLogger('waitress')
    logger.setLevel(logging.DEBUG)
    serve(app, host='0.0.0.0', port=8080)
