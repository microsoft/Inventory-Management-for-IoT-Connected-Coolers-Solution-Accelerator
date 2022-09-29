# Copyright (c) Microsoft Corporation. All rights reserved
# Licensed under the MIT license. See LICENSE file in the project root for more information

from app import app as application

def create():
    application.run(host='127.0.0.1', port=8888)
