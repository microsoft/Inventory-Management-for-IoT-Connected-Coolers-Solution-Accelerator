# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import asyncio
import sys
import signal
import threading
import json
import time
import os

from azure.iot.device import IoTHubModuleClient
from azure.iot.device import MethodResponse

# from recording import RecordingManager
# from session import SessionManager, CoolerDoor
from messaging.producer import RabbitMQConfig, RabbitMQPublish
from gstrecorder import CoolerCamera

# Event indicating client stop
stop_event = threading.Event()

def create_client():
    client = IoTHubModuleClient.create_from_edge_environment()
    client.connect()
        
    time.sleep(5)

    rabbit_config = RabbitMQConfig(queue='videoAvailableForInferencing',
                            host=os.getenv("RABBITMQ_HOST_LOCATION"),
                            routingKey='videoAvailableForInferencing',
                            exchange=''
                            )
    rabbitmq = RabbitMQPublish(rabbit_config)

    is_simulated = True if os.environ['IS_SIMULATED'] == "True" else False

    mycooler = CoolerCamera('testcooler', rabbitmq, os.environ['TOP_CAMERA_URL'], os.environ['BOTTOM_CAMERA_URL'], simulated=is_simulated)
        
    # Define function for handling received messages
    def receive_message_handler(message):
        # NOTE: This function only handles messages sent to "input1".
        # Messages sent to other inputs, or to the default, will be discarded   
        
        if message.input_name == "input1":
            
            message_body = json.loads(message.data)            
                
            print(message_body)                        
            print(message_body['doorOpen'])                        
            if message_body['doorOpen']:
                print('Door Open: ', message_body['doorOpen'])                                
                mycooler.start_recording()
            else:                
                mycooler.stop_recording()
            
            client.send_message_to_output(message, "output1")
            
    async def twin_patch_handler(patch):
        print(f'Desired Properties: {patch}')
                    

    try:
        # Set handler on the client
        client.on_message_received = receive_message_handler
        # client.on_twin_desired_properties_patch_received = twin_patch_handler        
    except:
        # Cleanup if failure occurs
        client.shutdown()
        raise

    return client


async def run_sample(client):
    # Customize this coroutine to do whatever tasks the module initiates
    # e.g. sending messages
    while True:
        await asyncio.sleep(1000)


def main():
    if not sys.version >= "3.5.3":
        raise Exception( "The sample requires python 3.5.3+. Current version of Python: %s" % sys.version )
    print ( "IoT Hub Client for Python" )

    # NOTE: Client is implicitly connected due to the handler being set on it
    client = create_client()

    # Define a handler to cleanup when module is is terminated by Edge
    def module_termination_handler(signal, frame):
        print ("IoTHubClient sample stopped by Edge")
        stop_event.set()

    # Set the Edge termination handler
    signal.signal(signal.SIGTERM, module_termination_handler)

    # Run the sample
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(run_sample(client))
    except Exception as e:
        print("Unexpected error %s " % e)
        raise
    finally:
        print("Shutting down IoT Hub Client...")
        loop.run_until_complete(client.shutdown())
        loop.close()


if __name__ == "__main__":
    main()
