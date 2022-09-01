# Training Pipeline - Automated ML
If this is your first time running through this notebook, uncomment the top 3 cells installing / upgrading the libraries, and run each in order.  When finished, go to the _Kernel_ menu and choose _Restart_.

```python
!pip install --upgrade azureml-sdk
!pip install --upgrade azureml-train-automl
!pip install azureml-contrib-automl-pipeline-steps
```

## 1.0 Set up workspace, datastore, experiment

Change the following in the first cell

```python
# set up datastores
#dstore = ws.get_default_datastore()
# Get a named datastore from the current workspace
dstore = Datastore.get(ws, datastore_name='automl_many_models')
```

In the second cell, change the name of the training pipeline

`experiment = Experiment(ws, 'connectedcooler-training-pipeline')`

## 2.0 Call the registered filedataset

`filedst_10_models = Dataset.get_by_name(ws, name='coolerdataset_train')`

## 3.0 Build the training pipeline

`provisioning_config = AmlCompute.provisioning_configuration(vm_size='Standard_DS3_v2',`

```python
import logging

partition_column_names = ['CoolerId', 'ItemSku']

automl_settings = {
    "task" : 'forecasting',
    #"freq" : "D",
    "primary_metric" : 'normalized_root_mean_squared_error',
    "iteration_timeout_minutes" : 10, # This needs to be changed based on the dataset. We ask customer to explore how long training is taking before settings this value
    "iterations" : 5,
    "experiment_timeout_hours" : .5,
    "label_column_name" : 'ItemQuantity',
    "n_cross_validations" : 3,
    # "verbosity" : logging.INFO, 
    # "debug_log": 'automl_oj_sales_debug.txt',
    "time_column_name": 'PickListFulfilledTimestamp',
    "max_horizon" : 20,
    "track_child_runs": False,
    "partition_column_names": partition_column_names,
    "grain_column_names": ['CoolerId', 'ItemSku'],
    "pipeline_fetch_max_batch_size": 15
}
```

### No other changes are required for this notebook

For instructions on how to schedule this pipeline to run on a cadence, for example you could run it weekly for the IoT Connected Cooler Solution Accelerator, see _7.0 Publish and schedule the pipeline (Optional)_.
