# Copyright (c) 2021, Hyunwoong Ko. All rights reserved.
# Copyright (c) 2022, Billy Cao. All rights reserved.
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

import torch
from transformers import AutoModelForSeq2SeqLM, PreTrainedTokenizerFast
from flask import Flask, request, jsonify

app = Flask(__name__)


class Summarizers(object):

    def __init__(self, type="normal", device="cpu"):
        """
        Constructor of Summarizers

        Args:
            type (str): type of article. (e.g. normal, paper, patent)
            device (str): device for inference (e.g. cpu, cuda)
        """

        type = type.lower()
        model_name_prefix = "hyunwoongko/ctrlsum"

        assert type in ['normal', 'paper', 'patent'], "param `article_type` must be one of ['normal', 'paper', 'patent']"

        if type == "normal":
            model_name = f"{model_name_prefix}-cnndm"
        elif type == "paper":
            model_name = f"{model_name_prefix}-arxiv"
        elif type == "patent":
            model_name = f"{model_name_prefix}-bigpatent"

        self.device = device
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name).to(self.device)
        self.tokenizer = PreTrainedTokenizerFast.from_pretrained(model_name)
        self._5w1h = [
            "what ",
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
            "How ",
        ]

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


ctrlsum = Summarizers('normal', device='cuda')  # normal: CNNDM, paper, patent

# contents = 'Delivery within 3-days  Cash on delivery or Transfer Office Chair 04 Material: Mesh Colour: Black，Red，Grey Size:See the image Free Delivery Free Installation Fast respond to your inquiry Registered business For Your Information Dimension may be approximately 2-3cm different.  Free delivery to lift level If lift not available Extra Charges for Labour charges will apply. → 2nd level (no lift) $20 → 3rd level (no lift) $30 → 4th level (no lift) $40 → Delivery to Jurong Island, Sentosa, and Changi Airport $30  Appointment Based, Please indicate delivery date and the timing is according to the seller schedule only. Condo and office no weekend delivery. Strictly no exchange,return or refund. Blk2 Toa Payoh Industrial Park. S(319054)'
#
# query = input('Enter query: ')
# prompt = input('Enter prompt: ')
# result = ctrlsum(contents=contents, query=query, prompt=prompt, num_beams=5,
#                  top_k=None, top_p=None, no_repeat_ngram_size=4,
#                  length_penalty=1.0, question_detection=True)
# print(f'Query: {query}\nPrompt: {prompt}\nResult: {result}')


@app.route('/qna', methods=['POST'], )
def qna():
    contents = request.json
    source = contents['source']
    query = contents['query']
    prompt = contents['prompt']
    ans = ctrlsum(contents=source, query=query, prompt=prompt, num_beams=5,
                  top_k=None, top_p=None, no_repeat_ngram_size=4,
                  length_penalty=1.0, question_detection=True)
    return jsonify({'answer': ans})


if __name__ == '__main__':
    #app.run('0.0.0.0', 5000, True)
    app.run()
