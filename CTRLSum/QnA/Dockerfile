FROM nvidia/cuda:10.2-runtime-ubuntu18.04
WORKDIR /usr/src/app

# Configure the HUAWEI CLOUD source and install generic packages
RUN cp -a /etc/apt/sources.list /etc/apt/sources.list.bak && \
  sed -i "s@http://.*security.ubuntu.com@http://repo.huaweicloud.com@g" /etc/apt/sources.list && \
  sed -i "s@http://.*archive.ubuntu.com@http://repo.huaweicloud.com@g" /etc/apt/sources.list && \
  apt-get update && \
  apt-get install -y python3.8 python3-distutils curl zip zlib1g && \
  curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && \
  python3.8 get-pip.py && \
  pip install --trusted-host https://repo.huaweicloud.com -i https://repo.huaweicloud.com/repository/pypi/simple -U setuptools wheel && \
  pip install flask waitress && \
  rm -rf /var/lib/apt/lists/* && \
  apt-get clean

# Install model-specific dependencies
RUN pip3 install torch torchvision torchaudio && \
  pip install summarizers

# Copy code and model weights to working dir
COPY . .

# Clean up files
RUN rm /usr/src/app/Dockerfile /usr/src/app/get-pip.py && \
  pip cache purge

CMD ["python3.8", "QnA.py"]