# Modeling Demand for Contoso Cola

This document contains instructions for producing models and demand predictions for connected coolers. 
For these predictions to be useful, a per cooler, per product prediction is needed. 
Without that level of granularity, it would be impossible to accurately predict restocking dates for each cooler. 
Azure Machine Learning (AML) has a feature that facilitates the orchestration of training many models from a dataset, with the convenience of a repeatable pipeline. 

In this example, we are also taking advantage of AML's Auto ML feature, which will try a number of models to pick the best architecture for your solution (see AutoML documentation). 
A detailed example using these features is described in the [Many Models Solution Accelerator](https://github.com/microsoft/solution-accelerator-many-models). The example used is from weekly sales of orange juice data across a number of stores. We will modify the instructions to create a model for our hourly soda inventory data.

**Note:** This example data is provided as a starting point to see how the ML model could be generated and to demonstrate integrating it into the solution. In production, the IoT connected cooler solution would need to be up and running for an extended period of time to get initial data to train the model. The forecasting table data that is provided with this solution has been generated using AML and the Many Models process described here.

## Getting Started

### 1.0 Preparing the data

Walk through the steps outlined in the [demand_forecasting notebook](../cloudDeploy/notebooks/demand_forecasting.ipynb )

### 2.0 Building and testing the machine learning model

Open the [Many Models Solution Accelerator](https://github.com/microsoft/solution-accelerator-many-models), read over the full readme doc and watch the short videos to get familiar with the technologies and solution.

Follow SA instructions under "Getting Started"

1. **Deploy Resources**
1. **Configure Development Environment**  
  We will follow the Automated ML instructions to automatically generate a useful model without requiring deep data science expertise.

As per the instructions, you will next run the notebooks. Consider running these notebooks in the _Jupyter_ application on the AzureML VM instead of the _JupyterLab_ application as directed in the Many Models SA. The _Jupyter_ application is more stable with the solution as of the time of this writing.  
Before running each of these notebooks, please click on the links below for instructions on modifying the notebooks for this solution

[00_Setup_AML_Workspace.ipynb](./many_models_notebook_instructions/00_setup_aml_workspace.md)  
[01_Data_Preparation.ipynb](./many_models_notebook_instructions/01_Data_Preparation.md)  
[02_AutoML_Training_Pipeline.ipynb](./many_models_notebook_instructions/02_AutoML_Training_Pipeline.md)  
[03_AutoML_Forecasting_Pipeline.ipynb](./many_models_notebook_instructions/03_AutoML_Forecasting_Pipeline.md)

### 3.0 Predicting inventory levels

The Many Models solution accelerator does not specifically walk through how to use the inferencing pipeline to predict unknown, future inventory levels.  The process is basically the same as was followed to run the inferencing pipeline for test data, except that the data passed does not contain real values for the quantity measure, and future dates are provided.

Follow the instructions in the [prediction notebook](../cloudDeploy/notebooks/prediction.ipynb). **Note that this notebook should be run from the AzureML compute instance**, not the Synapse Spark environment.
