# Privacy

When you deploy this template, Microsoft is able to identify the installation of the software with the Azure resources that are deployed. Microsoft is able to correlate the Azure resources that are used to support the software. Microsoft collects this information to provide the best experiences with their products and to operate their business. The data is collected and governed by Microsoft's privacy policies, which can be found at [Microsoft Privacy Statement](https://go.microsoft.com/fwlink/?LinkID=824704).


To disable the telemetry in this solution, remove the following sections from the [start.deploy.json](./deployment/arm-templates/start.deploy.json) before deploying resources to Azure. 

- Method 1

            {
            "type": "Microsoft.Resources/resourceGroups",
            "apiVersion": "2020-06-01",
            "name": "[parameters('resourceGroup')]",
            "comments": "The primary resource group that will be used for new resources.",
            "location": "[deployment().location]",
            "properties": {},
            "tags": "[variables('resourceTags')]"
            },

            {
            "condition": "[not(parameters('useExistingEdgeDevice'))]",
            "type": "Microsoft.Resources/resourceGroups",
            "apiVersion": "2020-06-01",
            "name": "[variables('VMResourceGroup')]",
            "comments": "The primary resource group that will be used for new resources.",
            "location": "[deployment().location]",
            "properties": {},
            "tags": "[variables('resourceTags')]"
            }

- Method 2

            {
            "type": "Microsoft.Resources/deployments",
            "apiVersion": "2020-06-01",
            "name": "pid-158c9b70-6767-44a6-b677-8ac4ceb0502f",
            "location": "[deployment().location]",
            "properties": {
            "mode": "Incremental",
            "template": {
                "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
                "contentVersion": "1.0.0.0",
                "resources": []
            }
            }
            }