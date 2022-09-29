# Deployment files

The scripts in this folder are used to deploy the various Azure services and edge modules that are needed for this solution.  

## ARM Templates
- asa.deploy.json - Deploys Azure Stream Analytics, for monitoring IoT Hub messages 
- iot.deploy.json - Deploys the IoT Hub module
- mariner-vm.latest.json - Deploys the Mariner VM from a managed disk
- start.deploy.json - Main template, controls the flow between the rest of the deployment templates
- storage-account.deploy.json - Deploys storage account, for use with Azure Synapse 
- synapse.deploy.json - Deploys Azure Synapse Analytics, along with a Synapse workspace, and connects to storage
- webapp.deploy.json - Deploys the web app, for observing simulation results; can also be used with POC solution 

## Scripts
- deploy-modules.sh - This script is used to deploy the IoT Edge modules to the edge device, based off of the deployment manifest and update the topology for sample video
- mariner-vm-init.sh - Configures the IoT Edge device with the required user and folder structures
- register-edge-device.sh - Deploys a new IoT Hub, if necessary, and captures the connection string for the new IoT Hub




