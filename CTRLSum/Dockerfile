FROM nvidia/cuda:10.2-devel-ubuntu18.04
WORKDIR /usr/src/app


# Configure the HUAWEI CLOUD source and install Python, Python3-PIP
RUN cp -a /etc/apt/sources.list /etc/apt/sources.list.bak && \
  sed -i "s@http://.*security.ubuntu.com@http://repo.huaweicloud.com@g" /etc/apt/sources.list && \
  sed -i "s@http://.*archive.ubuntu.com@http://repo.huaweicloud.com@g" /etc/apt/sources.list && \
  sed -i "s@http://.*archive.ubuntu.com@http://repo.huaweicloud.com@g" /etc/apt/sources.list && \
  apt-get update && \
  apt-get install -y python3.8 python3-distutils curl zip zlib1g && \
  curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && \
  python3.8 get-pip.py && \
  pip install --trusted-host https://repo.huaweicloud.com -i https://repo.huaweicloud.com/repository/pypi/simple -U setuptools wheel && \
  python3.8 -m pip install --upgrade Pillow && \
  pip install torch torchvision torchaudio && \
  pip install fairseq sklearn datasets==1.0.1 spacy==2.3.2 stanza>=1.0.1 && \
  pip install summarizers flask waitress

#RUN curl -fSsl https://www.nvidia.com/content/DriverDownload-March2009/confirmation.php?url=/tesla/440.118.02/NVIDIA-Linux-x86_64-440.118.02.run&lang=us&type=Tesla
#RUN sh NVIDIA-Linux-x86_64-440.118.02.run

# Copy the application service code to the image.
COPY . .

CMD ["python3.8", "CTRLSum.py"]
