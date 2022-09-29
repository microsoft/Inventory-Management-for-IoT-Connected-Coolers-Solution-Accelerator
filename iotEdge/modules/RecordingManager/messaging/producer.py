# Copyright (c) Microsoft Corporation. All rights reserved
# Licensed under the MIT license. See LICENSE file in the project root for more informations
try:
    import pika
    import random
    import os
    import json

except Exception as e:
    print("Sone Modules are missings {}".format_map(e))

class RabbitMQConfig():
    
    def __init__(self, queue='TestQueue', host='localhost', routingKey='TestQueue', exchange='TestExchange'
    ):
        """ Configure Rabbit Mq Server  """
        self.queue = queue
        self.host = host
        self.routingKey = routingKey
        self.exchange = exchange

class RabbitMQPublish():
    def __init__(self, server):
        self.server = server
        self._credentials = pika.PlainCredentials(os.getenv("RABBITMQ_DEFAULT_USER"), os.getenv("RABBITMQ_DEFAULT_PASS"))
        self._connection = pika.BlockingConnection(pika.ConnectionParameters(host=self.server.host, credentials=self._credentials, heartbeat=0))
        self._channel = self._connection.channel()
        self._channel.queue_declare(queue=self.server.queue)
        self._parameters = pika.ConnectionParameters(host=self.server.host)
        
        

    def publish(self, payload ={}):
        #msg_properties = pika.spec.BasicProperties(priority=priority)
        print(f'Publishing message: {payload}')
        print(type(payload))
        self._channel.basic_publish(exchange=self.server.exchange,
                      routing_key=self.server.routingKey,
                      body=json.dumps(payload))

        print("Published Message: {}".format(payload))        
        #self._connection.close()

if __name__ == "__main__":
    server = RabbitMQConfig(queue='AVA',
                               host=os.getenv("RABBITMQ_HOST_LOCATION"),
                               routingKey='AVA',
                               exchange=''
                               )

    
    # send a lot of test messages
    i = 1000
    while i > 0:
        
        priority = random.choice(range(1,3))
        val = random.choice(range(1000))
        rabbitmq = RabbitMQPublish(server)
        
        rabbitmq.publish(payload={"RetortTempData":val})




