FROM nvidia/cuda:10.2-devel-ubuntu18.04
WORKDIR /usr/src/app

# Configure the HUAWEI CLOUD source and install Python, Python3-PIP
RUN cp -a /etc/apt/sources.list /etc/apt/sources.list.bak && \
  sed -i "s@http://.*security.ubuntu.com@http://repo.huaweicloud.com@g" /etc/apt/sources.list && \
  sed -i "s@http://.*archive.ubuntu.com@http://repo.huaweicloud.com@g" /etc/apt/sources.list && \
  apt-get update && \
  apt-get install -y python3.8 python3-distutils curl zip zlib1g && \
  curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && \
  python3.8 get-pip.py && \
  pip install --trusted-host https://repo.huaweicloud.com -i https://repo.huaweicloud.com/repository/pypi/simple -U setuptools wheel && \
  pip install transformers transformers[onnx] && \
  pip uninstall -y onnxruntime && \
  pip install onnxruntime-gpu && \
  pip install flask waitress

# Copy the application service code to the image.
COPY . .

CMD ["python3.8", "tagger-v3.py"]