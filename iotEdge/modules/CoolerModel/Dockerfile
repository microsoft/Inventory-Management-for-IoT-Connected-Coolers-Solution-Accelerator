# Copyright (c) Microsoft Corporation. All rights reserved
# Licensed under the MIT license. See LICENSE file in the project root for more information

FROM ubuntu:18.04

ARG WORK_DIR=/app
WORKDIR ${WORK_DIR}

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3-pip python3-dev libgl1 libglib2.0-0 libsm6 libxext6 libxrender-dev nginx supervisor python3-setuptools \
    && cd /usr/local/bin \
    && ln -s /usr/bin/python3 python \
    && pip3 install --upgrade pip \
    && pip install numpy motpy tensorflow opencv-python flask pika pillow gunicorn json-logging-py \
    && apt-get clean \
    && apt-get update && apt-get install -y --no-install-recommends \
    wget runit nginx \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

RUN pip install azure-iot-device

# Copy the app file
WORKDIR ${WORK_DIR}
COPY . .
CMD [ "python3", "-u", "./app.py" ]
