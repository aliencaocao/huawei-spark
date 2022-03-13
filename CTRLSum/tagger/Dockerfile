FROM nvidia/cuda:10.2-runtime-ubuntu18.04
WORKDIR /usr/src/app

# Configure the HUAWEI CLOUD source and install generic packages
RUN cp -a /etc/apt/sources.list /etc/apt/sources.list.bak && \
  sed -i "s@http://.*security.ubuntu.com@http://repo.huaweicloud.com@g" /etc/apt/sources.list && \
  sed -i "s@http://.*archive.ubuntu.com@http://repo.huaweicloud.com@g" /etc/apt/sources.list && \
  apt-get update && \
  apt-get install -y python3.8 python3-distutils curl wget zip zlib1g && \
  wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64/cuda-ubuntu1804.pin && \
  mv cuda-ubuntu1804.pin /etc/apt/preferences.d/cuda-repository-pin-600 && \
  apt-key adv --fetch-keys https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64/7fa2af80.pub && \
  apt-get install -y software-properties-common && \
  add-apt-repository "deb https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64/ /" && \
  apt-get update && \
  apt-get install -y libcudnn8=8.3.2.*-1+cuda10.2 && \
  apt-get install -y libcudnn8-dev=8.3.2.*-1+cuda10.2 && \
  curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && \
  python3.8 get-pip.py && \
  pip install --trusted-host https://repo.huaweicloud.com -i https://repo.huaweicloud.com/repository/pypi/simple -U setuptools wheel && \
  pip install flask waitress && \
  rm -rf /var/lib/apt/lists/* && \
  apt-get clean

# Install model-specific dependencies
RUN pip install transformers[onnxruntime] scipy && \
  pip uninstall -y onnxruntime && \
  pip install onnxruntime-gpu==1.6

# Copy code and model weights to working dir
COPY . .

# Clean up files
RUN rm /usr/src/app/Dockerfile /usr/src/app/get-pip.py && \
  pip cache purge

CMD ["python3.8", "tagger-v3.py"]