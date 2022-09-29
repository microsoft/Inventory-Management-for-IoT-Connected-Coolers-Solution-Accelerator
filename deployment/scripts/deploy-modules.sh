#!/usr/bin/env bash
# shellcheck disable=SC2154,SC2188,SC2129

# Copyright (c) Microsoft Corporation. All rights reserved
# Licensed under the MIT license. See LICENSE file in the project root for more information

#######################################################################################################
# This script is designed for use as a deployment script in a template
# https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/deployment-script-template
#
# It expects the following environment variables
# $DEPLOYMENT_MANIFEST_TEMPLATE_URL - the location of a template of an IoT Edge deployment manifest
# $PROVISIONING_TOKEN               - the token used for provisioing the edge module
# $HUB_NAME                         - the name of the IoT Hub where the edge device is registered
# $DEVICE_ID                        - the name of the edge device on the IoT Hub
# $VIDEO_OUTPUT_FOLDER_ON_DEVICE    - the folder where the file sink will store clips
# $VIDEO_INPUT_FOLDER_ON_DEVICE     - the folder where where rtspsim will look for sample clips
# $APPDATA_FOLDER_ON_DEVICE         - the folder where video analyzer module will store state
# $AZURE_STORAGE_ACCOUNT            - the storage where the deployment manifest will be stored
# $AZ_SCRIPTS_OUTPUT_PATH           - file to write output (provided by the deployment script runtime) 
# $RESOURCE_GROUP                   - the resource group that you are deploying in to
# $REGESTRY_PASSWORD                - the password for the container registry
# $REGISTRY_USER_NAME               - the user name for the container registry
# $IOT_HUB_CONNECTION_STRING        - the IoT Hub connection string
# $COGNITIVE_API_KEY
# $COGNITIVE_BILLING_ENDPOINT
#######################################################################################################

set -e

# Define helper function for logging
info() {
    echo "$(date +"%Y-%m-%d %T") [INFO]"
}

# Define helper function for logging. This will change the Error text color to red
error() {
    echo "$(date +"%Y-%m-%d %T") [ERROR]"
}

exitWithError() {
    # Reset console color
    exit 1
}

# automatically install any extensions
#az config set extension.use_dynamic_install=yes_without_prompt
az extension add --name azure-iot

# download the deployment manifest file
echo "$(info) downloading $DEPLOYMENT_MANIFEST_TEMPLATE_URL"                     # the template is general-sample-setup.modules.json
curl -s "$DEPLOYMENT_MANIFEST_TEMPLATE_URL" > deployment.json

# update the values in the manifest
echo "$(info) replacing value in manifest"
sed -i "s@\$VIDEO_OUTPUT_FOLDER_ON_DEVICE@${VIDEO_OUTPUT_FOLDER_ON_DEVICE}@g" deployment.json

sed -i "s@\$RABBITMQ_CONTAINER_HOST@${RABBITMQ_CONTAINER_HOST}@g" deployment.json
sed -i "s@\$RABBITMQ_DEFAULT_USER@${RABBITMQ_DEFAULT_USER}@g" deployment.json
sed -i "s@\$RABBITMQ_DEFAULT_PASS@${RABBITMQ_DEFAULT_PASS}@g" deployment.json
sed -i "s@\$RABBITMQ_HOSTNAME@${RABBITMQ_HOSTNAME}@g" deployment.json

sed -i "s@\$CONTAINER_REGISTRY_NAME_myacr@${REGISTRY_NAME}@g" deployment.json
sed -i "s@\$CONTAINER_REGISTRY_USERNAME_myacr@${REGISTRY_USER_NAME}@g" deployment.json
sed -i "s@\$CONTAINER_REGISTRY_PASSWORD_myacr@${REGISTRY_PASSWORD}@g" deployment.json

# Replace IP address with the windows host address
if [ "$DEPOLYMENTJSONPREFIX" = "deployment.physical.template" ]; then
  echo "$(info) replacing RTSP URL for physical deployment"
  TOP_CAMERA_URL="rtsp://eflow:ConnectedCoolerSA!!@$EXISTING_DEVICE_IP_ADDRESS:8554/Camera1"
  BOTTOM_CAMERA_URL="rtsp://eflow:ConnectedCoolerSA!!@$EXISTING_DEVICE_IP_ADDRESS:8554/Camera2"
  IS_SIMULATED=True
  
  sed -i "s@\$HOST_IP_ADDRESS@${EXISTING_DEVICE_IP_ADDRESS}@g" deployment.json
  sed -i "s@\$TOP_CAMERA_URL@${TOP_CAMERA_URL}@g" deployment.json
  sed -i "s@\$BOTTOM_CAMERA_URL@${BOTTOM_CAMERA_URL}@g" deployment.json
  sed -i "s@\$IS_SIMULATED@${IS_SIMULATED}@g" deployment.json

else
  echo "$(info) replacing RTSP URL for simulated deployment"
  TOP_CAMERA_URL="rtsp://SimulatorModule:8554/stream1"
  BOTTOM_CAMERA_URL="rtsp://SimulatorModule:8554/stream2"
  IS_SIMULATED=False

  sed -i "s@\$TOP_CAMERA_URL@${TOP_CAMERA_URL}@g" deployment.json
  sed -i "s@\$BOTTOM_CAMERA_URL@${BOTTOM_CAMERA_URL}@g" deployment.json
  sed -i "s@\$IS_SIMULATED@${IS_SIMULATED}@g" deployment.json
fi

# Add a file to build env.txt file from
> env.txt
echo "SUBSCRIPTION_ID=$SUBSCRIPTION_ID" >> env.txt
echo "RESOUCE_GROUP=$RESOURCE_GROUP" >> env.txt
echo "VIDEO_OUTPUT_FOLDER_ON_DEVICE=$VIDEO_OUTPUT_FOLDER_ON_DEVICE" >> env.txt

echo "CONTAINER_REGISTRY_NAME_myacr=$REGISTRY_NAME" >> env.txt
echo "CONTAINER_REGISTRY_PASSWORD_myacr=$REGISTRY_PASSWORD" >> env.txt
echo "CONTAINER_REGISTRY_USERNAME_myacr=$REGISTRY_USER_NAME" >> env.txt

echo "RABBITMQ_CONTAINER_HOST=$RABBITMQ_CONTAINER_HOST" >> env.txt
echo "RABBITMQ_DEFAULT_USER=$RABBITMQ_DEFAULT_USER" >> env.txt
echo "RABBITMQ_DEFAULT_PASS=$RABBITMQ_DEFAULT_PASS" >> env.txt
echo "RABBITMQ_HOSTNAME=$RABBITMQ_HOSTNAME" >> env.txt

echo "TOP_CAMERA_URL=$TOP_CAMERA_URL" >> env.txt
echo "BOTTOM_CAMERA_URL=$BOTTOM_CAMERA_URL" >> env.txt

# deploy the manifest to the iot hub
echo "$(info) deploying manifest to $DEVICE_ID on $HUB_NAME"
az iot edge set-modules --device-id "$DEVICE_ID" --hub-name "$HUB_NAME" --content deployment.json --only-show-error -o table

# store the manifest for later reference
echo "$(info) storing manifest for reference"
az storage share create --name deployment-output --account-name "$AZURE_STORAGE_ACCOUNT"
az storage file upload --share-name deployment-output --source deployment.json --account-name "$AZURE_STORAGE_ACCOUNT"
az storage file upload --share-name deployment-output --source env.txt --account-name "$AZURE_STORAGE_ACCOUNT"
