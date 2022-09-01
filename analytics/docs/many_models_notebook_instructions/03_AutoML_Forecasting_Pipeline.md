# Forecasting Pipeline - Automated ML

## 1.0 Call the Workspace, Datastore, and Compute

Change to using our named datastore

```python
# set up datastores
#dstore = ws.get_default_datastore()

# Get a named datastore from the current workspace
dstore = Datastore.get(ws, datastore_name='automl_many_models2')
```

Switch to the smaller VM size

`provisioning_config = AmlCompute.provisioning_configuration(vm_size='STANDARD_D16S_V3',`

## 2.0 Call Registered FileDataset

`filedst_10_models = Dataset.get_by_name(ws, name='coolerdataset_inference', version='latest')`

## 3.0 Build forecasting pipeline

Change the following values, note that the training_pipeline_run_id is not the runId avaialable from the AML portal in Azure, this value will be in the output from your training run in notebook 02_AutoML_Training_Pipeline.

```python
training_experiment_name = "connectedcooler-training-pipeline"
training_pipeline_run_id ="<Enter from Training Notebook>"
```

In the next cell, change the following values to match the ones from the IoT Cooler data set

```python
partition_column_names = ['CoolerId', 'ItemSku']
time_column_name="PickListFulfilledTimestamp",
target_column_name="ItemQuantity")
```

## 5.0 Pipeline Outputs

To view the outputs, change the columns definition
`df.columns = ["Id", "PickListId", "PickListFulfilledTimestamp", "CoolerId", "ItemSku",  "ItemQuantity"]`
