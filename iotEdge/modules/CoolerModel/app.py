#!/usr/bin/env python

# Copyright (c) Microsoft Corporation. All rights reserved
# Licensed under the MIT license. See LICENSE file in the project root for more information

import pika
import sys
import os
import json
import functools
from inference import do_inference2
from azure.iot.device import IoTHubModuleClient

def main():
    credentials = pika.PlainCredentials(os.getenv("RABBITMQ_DEFAULT_USER"), os.getenv("RABBITMQ_DEFAULT_PASS"))
    host = os.getenv("RABBITMQ_HOST_LOCATION")
    portnum = 5672
    parameters = pika.ConnectionParameters(host,portnum,'/', credentials, heartbeat=0)
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()
    client = IoTHubModuleClient.create_from_edge_environment()

    channel.queue_declare(queue='videoAvailableForInferencing')

    def callback(ch, method, properties, body, args):
        client = args
        print(" [x] Received %r" % body)
        # put logic to parse body (i.e. filename etc..)
        body = json.loads(body)
        topfilepath = body["topcameraLocation"]
        bottomfilepath = body["bottomcameraLocation"]
        start_time = body["startTime"]

        topfilelocation = topfilepath.split("/")
        bottomfilelocation = bottomfilepath.split("/")

        topfilename = topfilelocation[4]
        bottomfilename = bottomfilelocation[4]        

        topout_file = os.path.join('/'.join(topfilelocation[:4]), 'output' + topfilename)
        bottomout_file = os.path.join('/'.join(bottomfilelocation[:4]), 'output' + bottomfilename)


        # call inferencing function with args
        do_inference2(client=client, top=topfilepath, bottom=bottomfilepath,
                      top_output=topout_file, bottom_output=bottomout_file,
                      time_start=start_time, preview=None)

        ch.basic_ack(delivery_tag = method.delivery_tag)

    on_message_callback = functools.partial(callback, args=client)
    channel.basic_consume(queue='videoAvailableForInferencing', on_message_callback=on_message_callback)

    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
