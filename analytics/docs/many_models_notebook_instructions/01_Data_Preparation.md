# Data Preparation

If you have walked through the steps in the demand_forecasting notebook, you will have already prepared and split your data, and you already have it stored in Azure Blob storage.  If not, please run this notebook now.

Skip all steps up to...

## 3.0 Upload data to Datastore in AML Workspace

Run the first cell as-is to get the workspace

```python
from azureml.core.workspace import Workspace

ws = Workspace.from_config()

# Take a look at Workspace
ws.get_details()
```

Then skip to the section "[Optional] If data is already in Azure: create Datastore from it"

Next, [retrieve the account key](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys) for the default Synapse storage account

Set the first cell in this section as follows

```python
blob_datastore_name = "automl_many_models"
container_name = "mldata"
account_name = "<Storage Account Name>"
account_key = "<Storage Account Key>"
```

Change the next cell as follows:

```python
from azureml.core import Datastore

datastore = Datastore.register_azure_blob_container(
    workspace=ws, 
    datastore_name=blob_datastore_name, 
    container_name=container_name,
    account_name=account_name,
    account_key=account_key,
    create_if_not_exists=True
)

ds_train_path = 'ds-train/'
ds_inference_path = 'ds-inference/'
ds_predict_path = 'ds-predict'
```

## 3.1 [Added] Delete spark data remnants

At this point, we need to delete a Spark artifact from our data processing on the Synapse side. Spark partitions generate an empty __SUCCESS_ file after successful operations. This unfortunately causes issues in the AML dataset as of the time of this writing. Add and run the following script cell to delete these files.

```python
from azure.storage.blob import BlobServiceClient

delete_file = '_SUCCESS'

blob_service_client = BlobServiceClient(f"https://{account_name}.blob.core.windows.net",account_key)

blob_client = blob_service_client.get_blob_client(container=container_name, blob=f"{ds_train_path}/{delete_file}")
blob_client.delete_blob()
blob_client = blob_service_client.get_blob_client(container=container_name, blob=f"{ds_inference_path}/{delete_file}")
blob_client.delete_blob()
```

## 4.0 Register dataset in AML Workspace

Change the following three lines in the first cell

```python
# Register the file datasets
#dataset_name = 'oj_data_small' if 0 < dataset_maxfiles < 11973 else 'oj_data'
dataset_name = 'coolerdataset'
train_dataset_name = dataset_name + '_train2'
inference_dataset_name = dataset_name + '_inference3'
```
