#!/bin/bash

# RG

az group create --name concooler-arm-temp --location westus
az group delete --name concooler-arm-temp

# Synapse

az deployment group create --resource-group concooler-arm-temp --template-file deploy_synapse.json

# ASA

az deployment group create --resource-group concooler-arm-temp --template-file deploy_synapse.json --parameters deploy_asa.local.parameters.json