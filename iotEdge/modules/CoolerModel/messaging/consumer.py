import pika
import ast
import os
import logging
import json
from azure.iot.device import IoTHubModuleClient, Message

logging.basicConfig(format='%(asctime)s  %(levelname)-10s %(message)s', datefmt="%Y-%m-%d-%H-%M-%S",
    level=logging.INFO)

class RabbitMqConfig:
    def __init__(self, host="localhost", queue="TestQueue"):

        """ Server initialization   """

        self.host = host
        self.queue = queue


class RabbitMqReceive:
    def __init__(self, server):

        """
        :param server: Object of class RabbitMqServerConfigure
        """

        self.server = server
        self._credentials = pika.PlainCredentials(
            os.getenv("RABBITMQ_DEFAULT_USER"), os.getenv("RABBITMQ_DEFAULT_PASS")
        )
        self._connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=self.server.host, credentials=self._credentials
            )
        )
        self._channel = self._connection.channel()
        self._tem = self._channel.queue_declare(
            queue=self.server.queue, 
            arguments={"x-max-priority": 2}
        )        

        print("Server started waiting for Messages... [press CTRL + C to stop] ")

    @staticmethod
    def proccess_output(body):
        # format message body so it appears as json format in IotHub
        Payload = body.decode("utf-8")       
        message = json.loads(Payload)
        message = json.dumps(message)

        # send to IoT Hub
        client.send_message_to_output(message, "output1")

    @staticmethod
    def callback(ch, method, properties, body):
        RabbitMqReceive.proccess_output(body)


    def process_messages(self):
        self._channel.basic_consume(
            queue=self.server.queue,
            on_message_callback=RabbitMqReceive.callback,
            auto_ack=True,
        )
        self._channel.start_consuming()


if __name__ == "__main__":
    
    server = RabbitMqConfig(
        host=os.getenv('RABBITMQ_HOST_LOCATION'), 
        queue="PriorityMessageQueue"
    )
    client = IoTHubModuleClient.create_from_edge_environment()
    
    try:

        server = RabbitMqReceive(server=server)
        server.process_messages()
        server._connection.close()

    except KeyboardInterrupt:
        print ( "Message processing stopped" )

    except Exception as e:
        print ( "Unexpected error in message processing" )
        logging.error(e)
        

