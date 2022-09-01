#!/usr/bin/env bash

set -e


STORAGE_ACCOUNT_NAME="<insert your storage account name here>"
STORAGE_ACCOUNT_KEY="<insert your storage account key here>"
STORAGE_ACCOUNT_ARM_SCRIPTS_CONTAINER_NAME="arm-templates"

echo $STORAGE_ACCOUNT_NAME
echo $STORAGE_ACCOUNT_KEY

###########################################################
# Update the links to artifact location in the templates
###########################################################

echo "Updating artifact location in arm template"
artifactLocation="https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${STORAGE_ACCOUNT_ARM_SCRIPTS_CONTAINER_NAME}/"
jq --arg a "$artifactLocation" '.variables._artifactsLocation = $a' deployment/arm-templates/start.deploy.json > "tmp" && mv "tmp" deployment/arm-templates/start.deploy.json


###########################################################
# Check that the blob container exists and create it if missing
###########################################################

CONTAINER=$(az storage container exists --name "$STORAGE_ACCOUNT_ARM_SCRIPTS_CONTAINER_NAME" --account-name "$STORAGE_ACCOUNT_NAME" --account-key "$STORAGE_ACCOUNT_KEY" -o tsv)
if [ "$CONTAINER" == "False" ]; then
    echo "Creating temp container \"$STORAGE_ACCOUNT_ARM_SCRIPTS_CONTAINER_NAME\" for arm template scripts in storage account"
    az storage container create \
        --account-name "$STORAGE_ACCOUNT_NAME" \
        --account-key "$STORAGE_ACCOUNT_KEY" \
        --name "$STORAGE_ACCOUNT_ARM_SCRIPTS_CONTAINER_NAME" \
        --public-access blob


fi

###########################################################
# upload files to the blob storage container
###########################################################
echo "Uploading ARM Templates"
az storage blob upload-batch \
    --account-name "$STORAGE_ACCOUNT_NAME" \
    --account-key "$STORAGE_ACCOUNT_KEY" \
    --source deployment/arm-templates \
    --pattern "*.json" \
    --destination "$STORAGE_ACCOUNT_ARM_SCRIPTS_CONTAINER_NAME"

echo "Uploading helper shell scripts"
az storage blob upload-batch \
    --account-name "$STORAGE_ACCOUNT_NAME" \
    --account-key "$STORAGE_ACCOUNT_KEY" \
    --source deployment/scripts \
    --pattern "*.sh" \
    --destination "$STORAGE_ACCOUNT_ARM_SCRIPTS_CONTAINER_NAME"

echo "Uploading edge deployment manifest"
az storage blob upload \
    --account-name "$STORAGE_ACCOUNT_NAME" \
    --account-key "$STORAGE_ACCOUNT_KEY" \
    --container-name "$STORAGE_ACCOUNT_ARM_SCRIPTS_CONTAINER_NAME" \
    --file iotEdge/deployment.simulated.template.json \
    --name deployment.simulated.template.json

az storage blob upload \
    --account-name "$STORAGE_ACCOUNT_NAME" \
    --account-key "$STORAGE_ACCOUNT_KEY" \
    --container-name "$STORAGE_ACCOUNT_ARM_SCRIPTS_CONTAINER_NAME" \
    --file iotEdge/deployment.physical.template.json \
    --name deployment.physical.template.json    

###########################################################
# Generate and output the deploy to Azure button URL
###########################################################    
DEPLOY_TO_AZURE_URL="https://portal.azure.com/#create/Microsoft.Template/uri/"
URL_TO_ENCODE="https://$STORAGE_ACCOUNT_NAME.blob.core.windows.net/$STORAGE_ACCOUNT_ARM_SCRIPTS_CONTAINER_NAME/start.deploy.json"
ENCODED_URL=$(printf %s $URL_TO_ENCODE | jq -sRr @uri)

DEPLOY_TO_AZURE_BUTTON="${DEPLOY_TO_AZURE_URL}${ENCODED_URL}"
echo "Use the below link to deploy the ARM template:"
echo $DEPLOY_TO_AZURE_BUTTON
